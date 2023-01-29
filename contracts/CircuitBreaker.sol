// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {console} from "hardhat/console.sol";
import {FixedPoint} from "./lib/FixedPoint.sol";

contract CircuitBreaker is Pausable, AutomationCompatibleInterface {
    using BitMaps for BitMaps.BitMap;
    using FixedPoint for int256;

    address public owner;
    int256 public limit;
    int256 public currentPrice;
    uint256 public volatilityPercentage;
    uint256 public interval;
    address public externalContract;
    bytes public functionSelector;
    bool public usingExternalContract;
    address public keeperRegistryAddress;
    AggregatorV3Interface public priceFeed;
    BitMaps.BitMap private currentEventsMapping;
    uint8 configuredCount = 0;

    enum EventType {
        Limit,
        Staleness,
        Volatility
    }

    //------------------------------ EVENTS ----------------------------------

    event Limit(int256 percentage);
    event Staleness(uint256 interval);
    event Volatility(int256 indexed percentage, uint256 indexed currentPrice, int256 indexed lastPrice);
    event KeeperRegistryAddressUpdated(address oldAddress, address newAddress);
    event EventsTriggered(EventType[] events);
    event StalenessEventUpdated(uint256 old, uint256 updated);
    event LimitEventUpdated(int256 old, int256 updated);
    event VolatilityEventUpdated(
        int256 oldPrice, int256 updatedPrice, uint256 oldPercentage, uint256 updatedPercentage
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

    constructor(address feed, uint8[] memory eventTypes, address keeperAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(feed);
        setKeeperRegistryAddress(keeperAddress);
        for (uint256 i = 0; i < eventTypes.length; i++) {
            require(eventTypes[i] < 3, "Not a valid event type");
            require(!currentEventsMapping.get(eventTypes[i]), "Event type already configured");
            currentEventsMapping.set(eventTypes[i]);
            configuredCount++;
        }
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
            require(!currentEventsMapping.get(eventTypes[i]), "Event type already configured");
            currentEventsMapping.set(eventTypes[i]);
            configuredCount++;
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
     * @param newLimit The price to watch for.
     */
    function setLimit(int256 newLimit) external onlyOwner {
        limit = newLimit;
        emit LimitEventUpdated(limit, newLimit);
    }

    /**
     * @notice Sets staleness event parameters.
     * @param newInterval The interval to check against.
     */
    function setStaleness(uint256 newInterval) external onlyOwner {
        interval = newInterval;
        emit StalenessEventUpdated(interval, newInterval);
    }

    /**
     * @notice Sets volatility event parameters.
     * @param newPrice The current price from chainlink feed.
     * @param newPercentage The percentage change to check against. Must be wei units and not greater than 100% (i.e. 100% = 1000000000000000000).
     * (i.e. 1% = 10000000000000000).
     */
    function setVolatility(int256 newPrice, uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 1000000000000000000, "Percentage must be <= than 100%");
        currentPrice = newPrice;
        volatilityPercentage = newPercentage;
        emit VolatilityEventUpdated(currentPrice, newPrice, volatilityPercentage, newPercentage);
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
    function setKeeperRegistryAddress(address newKeeperRegistryAddress) public onlyOwner {
        require(newKeeperRegistryAddress != address(0));
        emit KeeperRegistryAddressUpdated(keeperRegistryAddress, newKeeperRegistryAddress);
        keeperRegistryAddress = newKeeperRegistryAddress;
    }

    function getLatestPrice() internal view returns (int256, uint256) {
        (, int256 price,, uint256 timeStamp,) = priceFeed.latestRoundData();
        return (price, timeStamp);
    }

    function checkVolatility(int256 price) internal view returns (bool, EventType, int256) {
        (bool v, int256 pc) = (_calculateChange(price));
        if (v) {
            return (true, EventType.Volatility, pc);
        }

        return (false, EventType.Volatility, 0);
    }

    function checkStaleness(uint256 timeStamp) internal view returns (bool, EventType) {
        if (block.timestamp - timeStamp > interval) {
            return (true, EventType.Staleness);
        }
        return (false, EventType.Staleness);
    }

    function checkLimit(int256 price) internal view returns (bool, EventType) {
        if (price >= limit) {
            return (true, EventType.Limit);
        }
        return (false, EventType.Limit);
    }

    function _calculateChange(int256 price) internal view returns (bool, int256) {
        int256 percentageChange = (price - currentPrice).divd(currentPrice).muld(1e18);

        int256 absValue = percentageChange < 0 ? -percentageChange : percentageChange;
        if (uint256(absValue) > volatilityPercentage) {
            return (true, absValue);
        }

        return (false, 0);
    }

    function checkEvents(int256 price, uint256 timeStamp) internal returns (bool, EventType[] memory) {
        EventType[] memory triggeredEvents = new EventType[](
            configuredCount
        );
        uint8 index = 0;
        for (uint256 i = 0; i < 3; i++) {
            if (currentEventsMapping.get(i)) {
                if (EventType(i) == EventType.Volatility) {
                    (bool volEvent, EventType ev,) = checkVolatility(price);
                    if (volEvent) {
                        triggeredEvents[index] = ev;
                        index++;
                    }
                } else if (EventType(i) == EventType.Staleness) {
                    (bool stalenessEvent, EventType es) = checkStaleness(timeStamp);
                    if (stalenessEvent) {
                        triggeredEvents[index] = es;
                        index++;
                    }
                } else if (EventType(i) == EventType.Limit) {
                    (bool limitEvent, EventType el) = checkLimit(price);
                    if (limitEvent) {
                        triggeredEvents[index] = el;
                        index++;
                    }
                }
            }
        }
        if (triggeredEvents.length > 0) {
            emit EventsTriggered(triggeredEvents);
            return (true, triggeredEvents);
        }
        return (false, triggeredEvents);
    }

    /**
     * @notice Custom function to be called by the keeper.
     */
    function customFunction() public onlyContract {
        (bool ok,) = externalContract.call(functionSelector);
        require(ok, "Custom function failed.");
    }

    /**
     * @notice Set custom function.
     * @param externalContractAddress The address of the external contract.
     * @param functionSelectorHex The function selector of the external contract.
     */
    function setCustomFunction(address externalContractAddress, bytes memory functionSelectorHex) external onlyOwner {
        require(externalContractAddress != address(0), "Invalid address.");
        externalContract = externalContractAddress;
        functionSelector = functionSelectorHex;
        usingExternalContract = true;
    }

    /**
     * @notice Pause custom function from running in upkeep.
     */
    function pauseCustomFunction() external onlyOwner {
        usingExternalContract = false;
    }

    /**
     * @notice Unpause custom function from running in upkeep.
     */
    function unpauseCustomFunction() external onlyOwner {
        usingExternalContract = true;
    }

    function checkUpkeep(bytes calldata /* checkData */ )
        external
        override
        whenNotPaused
        returns (bool upkeepNeeded, bytes memory /* performData */ )
    {
        (int256 price, uint256 timestamp) = getLatestPrice();

        (bool needed,) = checkEvents(price, timestamp);
        upkeepNeeded = needed;
    }

    function performUpkeep(bytes calldata /* performData */ ) external override whenNotPaused {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        (bool upkeepNeeded, EventType[] memory e) = checkEvents(price, timeStamp);
        if (upkeepNeeded) {
            for (uint256 i = 0; i < e.length; i++) {
                if (e[i] == EventType.Volatility) {
                    (, int256 pc) = (_calculateChange(price));
                    emit Volatility(pc, uint256(price), currentPrice);
                } else if (e[i] == EventType.Staleness) {
                    emit Staleness(interval);
                } else if (e[i] == EventType.Limit) {
                    emit Limit(limit);
                }
            }
        }
        if (usingExternalContract) {
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
