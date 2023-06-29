// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {ICircuitBreaker} from "./interfaces/ICircuitBreaker.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {FixedPoint} from "./lib/FixedPoint.sol";

contract CircuitBreaker is
    ICircuitBreaker,
    Pausable,
    AutomationCompatibleInterface
{
    using BitMaps for BitMaps.BitMap;
    using FixedPoint for int256;

    Limit public limit;
    ExternalContract internal externalContract;
    int256 public currentPrice;
    uint256 public volatilityPercentage;
    uint256 public interval;
    address public owner;
    address public keeperRegistryAddress;
    uint8 configuredCount = 0;
    AggregatorV3Interface public priceFeed;
    BitMaps.BitMap private currentEventsMapping;

    mapping(uint8 => bool) public eventFlags;

    /**
     * @notice Struct to store the low and high limit
     * @param low low limit
     * @param high high limit
     * @param lowActive checking low limit status
     * @param highActive checking high limit status
     */
    struct Limit {
        uint256 low;
        uint256 high;
        bool lowActive;
        bool highActive;
    }

    /**
     * @notice Struct to store the external contract address and function selector
     * @param contractAddress address of the external contract
     * @param functionSelector function selector of the external contract
     * @param status status of the external contract used to enable/disable the contract
     */
    struct ExternalContract {
        address contractAddress;
        bytes functionSelector;
        bool status;
    }

    enum EventType {
        Limit,
        Staleness,
        Volatility
    }

    //------------------------------ EVENTS ----------------------------------

    event LimitReached(
        uint256 lowLimit,
        uint256 highLimit,
        int256 currentPrice
    );
    event StalenessReached(uint256 interval);
    event VolatilityReached(
        int256 indexed percentage,
        uint256 indexed currentPrice,
        int256 indexed lastPrice
    );
    event KeeperRegistryAddressUpdated(address oldAddress, address newAddress);
    event EventsTriggered(EventType[] events);
    event StalenessUpdated(uint256 old, uint256 updated);
    event LimitUpdated(
        uint256 lowLimit,
        uint256 highLimit,
        bool lowActive,
        bool highActive
    );
    event VolatilityUpdated(
        int256 oldPrice,
        int256 updatedPrice,
        uint256 oldPercentage,
        uint256 updatedPercentage
    );

    // Errors

    error OnlyKeeperRegistry();

    // ------------------- MODIFIERS -------------------

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyContract() {
        require(msg.sender == owner || msg.sender == address(this));
        _;
    }

    modifier onlyKeeperRegistry() {
        if (msg.sender != keeperRegistryAddress) {
            revert OnlyKeeperRegistry();
        }
        _;
    }

    constructor(address feed, address keeperAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(feed);
        setKeeperRegistryAddress(keeperAddress);
    }

    /**
     * @notice Set the flag for a specific event.
     * @param eventType The type of event.
     * @param flag The new value of the flag.
     */
    function setEventFlag(uint8 eventType, bool flag) external onlyOwner {
        require(eventType < 3, "Not a valid event type");
        eventFlags[eventType] = flag;
    }

    /**
     * @notice Gets the event types that are configured.
     * @return EventType[] The list of event types.
     */
    function getEvents() external view returns (uint8[] memory) {
        uint8[] memory configuredEvents = new uint8[](configuredCount);
        uint8 index = 0;
        for (uint8 i = 0; i < 3; i++) {
            if (currentEventsMapping.get(i)) {
                configuredEvents[index] = i;
                index++;
            }
        }
        return configuredEvents;
    }

    /**
     * @notice Adds an event type to the list of configured events.
     * @param eventTypes The event type to add based on the EventType enum.
     */
    function addEventTypes(uint8[] memory eventTypes) external onlyOwner {
        for (uint8 i = 0; i < eventTypes.length; i++) {
            require(eventTypes[i] < 3, "Not a valid event type");
            require(
                !currentEventsMapping.get(eventTypes[i]),
                "Event type already configured"
            );
            currentEventsMapping.set(eventTypes[i]);
            configuredCount++;
            eventFlags[eventTypes[i]] = false; // Set the event flag to false.
        }
    }

    /**
     * @notice Deletes an event type from the list of configured events.
     * @param eventTypes The event type to delete based on the EventType enum.
     */
    function deleteEventTypes(uint8[] memory eventTypes) external onlyOwner {
        for (uint8 i = 0; i < eventTypes.length; i++) {
            require(eventTypes[i] < 3, "Not a valid event type");
            currentEventsMapping.unset(eventTypes[i]);
            configuredCount--;
        }
    }

    /**
     * @notice Sets limit event parameters.
     * @param newLowLimit The low range price to watch for as whole number `newLimit`e8.
     * (i.e. 1594.105 = 159410500000).
     * @param newHighLimit The high range price to watch for as whole number `newLimit`e8.
     */
    function setLimit(
        uint256 newLowLimit,
        uint256 newHighLimit
    ) external onlyOwner {
        require(
            newLowLimit > 0 || newHighLimit > 0,
            "Must set at least one limit"
        );
        bool lowActive = newLowLimit > 0;
        bool highActive = newHighLimit > 0;

        limit = Limit(newLowLimit, newHighLimit, lowActive, highActive);
        emit LimitUpdated(newLowLimit, newHighLimit, lowActive, highActive);
    }

    /**
     * @notice Sets staleness event parameters.
     * @param newInterval The interval to check against in seconds.
     */
    function setStaleness(uint256 newInterval) external onlyOwner {
        interval = newInterval;
        emit StalenessUpdated(interval, newInterval);
    }

    /**
     * @notice Sets volatility event parameters.
     * @param newPrice The current price from chainlink feed.
     * @param newPercentage The percentage change to check against. Must be wei units and not greater than 100% (i.e. 100% = 1000000000000000000).
     * (i.e. 1% = 10000000000000000).
     */
    function setVolatility(
        int256 newPrice,
        uint256 newPercentage
    ) external onlyOwner {
        require(
            newPercentage <= 1000000000000000000,
            "Percentage must be <= than 100%"
        );
        currentPrice = newPrice;
        volatilityPercentage = newPercentage;
        emit VolatilityUpdated(
            currentPrice,
            newPrice,
            volatilityPercentage,
            newPercentage
        );
    }

    /**
     * @notice Update price feed address.
     * @param feed The address of the price feed.
     */
    function updateFeed(address feed) external onlyOwner {
        priceFeed = AggregatorV3Interface(feed);
    }

    /**
     * @notice Sets the keeper registry address.
     * @param newKeeperRegistryAddress The address of the keeper registry.
     */
    function setKeeperRegistryAddress(
        address newKeeperRegistryAddress
    ) public onlyOwner {
        require(newKeeperRegistryAddress != address(0));
        emit KeeperRegistryAddressUpdated(
            keeperRegistryAddress,
            newKeeperRegistryAddress
        );
        keeperRegistryAddress = newKeeperRegistryAddress;
    }

    function _getLatestPrice() internal view returns (int256, uint256) {
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        return (price, timeStamp);
    }

    function _checkVolatility(
        int256 price
    ) internal view returns (bool, EventType, int256) {
        (bool v, int256 pc) = (_calculateChange(price));
        if (v) {
            return (true, EventType.Volatility, pc);
        }

        return (false, EventType.Volatility, 0);
    }

    function _checkStaleness(
        uint256 timeStamp
    ) internal view returns (bool, EventType) {
        if (block.timestamp - timeStamp > interval) {
            return (true, EventType.Staleness);
        }
        return (false, EventType.Staleness);
    }

    function _checkLimit(int256 price) internal view returns (bool, EventType) {
        if (
            (limit.lowActive && uint256(price) <= limit.low) ||
            (limit.highActive && uint256(price) >= limit.high)
        ) {
            return (true, EventType.Limit);
        }
        return (false, EventType.Limit);
    }

    function _calculateChange(
        int256 price
    ) internal view returns (bool, int256) {
        int256 percentageChange = (price - currentPrice)
            .divd(currentPrice)
            .muld(1e18);

        int256 absValue = percentageChange < 0
            ? -percentageChange
            : percentageChange;
        if (uint256(absValue) > volatilityPercentage) {
            return (true, absValue);
        }

        return (false, 0);
    }

    function _checkEvents(
        int256 price,
        uint256 timeStamp
    ) internal returns (bool, EventType[] memory) {
        EventType[] memory triggeredEvents = new EventType[](configuredCount);
        uint8 index = 0;
        for (uint256 i = 0; i < 3; i++) {
            if (currentEventsMapping.get(i) && !eventFlags[uint8(i)]) {
                bool eventTriggered = false;
                if (EventType(i) == EventType.Volatility) {
                    (bool volEvent, EventType ev, ) = _checkVolatility(price);
                    eventTriggered = volEvent;
                    if (volEvent) {
                        triggeredEvents[index] = ev;
                        index++;
                    }
                } else if (EventType(i) == EventType.Staleness) {
                    (bool stalenessEvent, EventType es) = _checkStaleness(
                        timeStamp
                    );
                    eventTriggered = stalenessEvent;
                    if (stalenessEvent) {
                        triggeredEvents[index] = es;
                        index++;
                    }
                } else if (EventType(i) == EventType.Limit) {
                    (bool limitEvent, EventType el) = _checkLimit(price);
                    eventTriggered = limitEvent;
                    if (limitEvent) {
                        triggeredEvents[index] = el;
                        index++;
                    }
                }
            }
        }
        return (index > 0, triggeredEvents);
    }

    /**
     * @notice Custom function to be called by the keeper.
     */
    function customFunction() public onlyContract {
        (bool ok, ) = externalContract.contractAddress.call(
            externalContract.functionSelector
        );
        require(ok, "Custom function failed.");
    }

    /**
     * @notice Set custom function.
     * @param externalContractAddress The address of the external contract.
     * @param functionSelectorHex The function selector of the external contract.
     */
    function setCustomFunction(
        address externalContractAddress,
        bytes memory functionSelectorHex
    ) external onlyOwner {
        require(externalContractAddress != address(0), "Invalid address.");
        require(functionSelectorHex.length > 0, "Invalid function selector.");
        externalContract = ExternalContract(
            externalContractAddress,
            functionSelectorHex,
            true
        );
    }

    /**
     * @notice Pause custom function from running in upkeep.
     */
    function pauseCustomFunction() external onlyOwner {
        externalContract.status = false;
    }

    /**
     * @notice Unpause custom function from running in upkeep.
     */
    function unpauseCustomFunction() external onlyOwner {
        externalContract.status = true;
    }

    /**
     * @notice Check custom function status.
     */
    function isCustomFunctionPaused() external view returns (bool) {
        return externalContract.status;
    }

    function getCustomFunctionInfo()
        external
        view
        returns (address, bytes memory, bool)
    {
        return (
            externalContract.contractAddress,
            externalContract.functionSelector,
            externalContract.status
        );
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        override
        whenNotPaused
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        (int256 price, uint256 timestamp) = _getLatestPrice();

        (bool needed, ) = _checkEvents(price, timestamp);
        upkeepNeeded = needed;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override whenNotPaused {
        (int256 price, uint256 timeStamp) = _getLatestPrice();
        (bool upkeepNeeded, EventType[] memory e) = _checkEvents(
            price,
            timeStamp
        );
        if (upkeepNeeded) {
            for (uint256 i = 0; i < e.length; i++) {
                // Check if the event has already been triggered by checking the flag
                if (!eventFlags[uint8(e[i])]) {
                    if (e[i] == EventType.Volatility) {
                        (, int256 pc) = (_calculateChange(price));
                        emit VolatilityReached(
                            pc,
                            uint256(price),
                            currentPrice
                        );
                    }
                    if (e[i] == EventType.Staleness) {
                        emit StalenessReached(interval);
                    }
                    if (e[i] == EventType.Limit) {
                        emit LimitReached(limit.low, limit.high, price);
                    }

                    // Set the flag for the event to prevent it from triggering again
                    eventFlags[uint8(e[i])] = true;
                }
            }
        }
        if (externalContract.status) {
            customFunction();
        }
    }

    /**
     * @notice Pause to prevent executing performUpkeep.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Check contract status.
     */
    function isPaused() external view returns (bool) {
        return paused();
    }
}
