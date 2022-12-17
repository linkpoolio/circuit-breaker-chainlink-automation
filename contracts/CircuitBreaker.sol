// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CircuitBreaker is Pausable, AutomationCompatibleInterface {
    address public owner;
    int256 public limit;
    int256 public currentPrice;
    int8 public volatilityPercentage;
    uint256 public interval;
    address public externalContract;
    bytes public functionSelector;
    bool public usingExternalContract;
    address public keeperRegistryAddress;
    AggregatorV3Interface public priceFeed;
    EventType[] public configuredEvents;

    enum EventType {
        Limit,
        Staleness,
        Volatility
    }

    //------------------------------ EVENTS ----------------------------------

    event Limit(int256 percentage);
    event Staleness(uint256 interval);
    event Volatility(
        int256 indexed percentage,
        uint256 indexed currentPrice,
        int256 indexed lastPrice
    );
    event KeeperRegistryAddressUpdated(address oldAddress, address newAddress);

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

    constructor(
        address _feed,
        uint8[] memory _eventTypes,
        address _keeperRegistryAddress
    ) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(_feed);
        setKeeperRegistryAddress(_keeperRegistryAddress);
        for (uint256 i = 0; i < _eventTypes.length; i++) {
            configuredEvents.push(EventType(_eventTypes[i]));
        }
    }

    /**
     * @notice Gets the event types that are configured.
     * @return EventType[] The list of event types.
     */
    function getEvents() external view returns (EventType[] memory) {
        return configuredEvents;
    }

    /**
     * @notice Adds an event type to the list of configured events.
     * @param _eventType The event type to add based on the EventType enum.
     */
    function addEventType(uint8 _eventType) external onlyOwner {
        for (uint256 i = 0; i < configuredEvents.length; i++) {
            require(
                configuredEvents[i] != EventType(_eventType),
                "Event already added."
            );
        }
        configuredEvents.push(EventType(_eventType));
    }

    /**
     * @notice Deletes an event type from the list of configured events.
     * @param _eventType The event type to delete based on the EventType enum.
     */
    function deleteEventType(uint8 _eventType) external onlyOwner {
        for (uint256 i = 0; i < configuredEvents.length; i++) {
            if (configuredEvents[i] == EventType(_eventType)) {
                configuredEvents[i] = configuredEvents[
                    configuredEvents.length - 1
                ];
                configuredEvents.pop();
                break;
            }
        }
    }

    /**
     * @notice Sets limit event parameters.
     * @param _limit The price to watch for.
     */
    function setLimit(int256 _limit) external onlyOwner {
        limit = _limit;
    }

    /**
     * @notice Sets staleness event parameters.
     * @param _interval The interval to check against.
     */
    function setStaleness(uint256 _interval) external onlyOwner {
        interval = _interval;
    }

    /**
     * @notice Sets volatility event parameters.
     * @param _currentPrice The current price.
     * @param _percentage The percentage change to check against.
     */
    function setVolatility(int256 _currentPrice, int8 _percentage)
        external
        onlyOwner
    {
        currentPrice = _currentPrice;
        volatilityPercentage = _percentage;
    }

    /**
     * @notice Update price feed address.
     * @param _feed The address of the price feed.
     */
    function updateFeed(address _feed) external onlyOwner {
        priceFeed = AggregatorV3Interface(_feed);
    }

    /**
     * @notice Sets the keeper registry address.
     */
    function setKeeperRegistryAddress(address _keeperRegistryAddress)
        public
        onlyOwner
    {
        require(_keeperRegistryAddress != address(0));
        emit KeeperRegistryAddressUpdated(
            keeperRegistryAddress,
            _keeperRegistryAddress
        );
        keeperRegistryAddress = _keeperRegistryAddress;
    }

    function getLatestPrice() internal view returns (int256, uint256) {
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        return (price, timeStamp);
    }

    function checkVolatility(int256 _price)
        internal
        view
        returns (
            bool,
            EventType,
            int256
        )
    {
        (bool v, int256 pc) = (calculateChange(_price));
        if (v) {
            return (true, EventType.Volatility, pc);
        }

        return (false, EventType.Volatility, 0);
    }

    function checkStaleness(uint256 _timeStamp)
        internal
        view
        returns (bool, EventType)
    {
        if (block.timestamp - _timeStamp > interval) {
            return (true, EventType.Staleness);
        }
        return (false, EventType.Staleness);
    }

    function checkLimit(int256 _price) internal view returns (bool, EventType) {
        if (_price >= limit) {
            return (true, EventType.Limit);
        }
        return (false, EventType.Limit);
    }

    function calculateChange(int256 price)
        internal
        view
        returns (bool, int256)
    {
        int256 percentageChange = ((price - currentPrice) / currentPrice) * 100;
        int256 absValue = percentageChange < 0
            ? -percentageChange
            : percentageChange;
        if (absValue > volatilityPercentage) {
            return (true, absValue);
        }

        return (false, 0);
    }

    function checkEvents(int256 _price, uint256 _timeStamp)
        internal
        view
        returns (bool, EventType[] memory)
    {
        EventType[] memory triggeredEvents = new EventType[](
            configuredEvents.length
        );
        for (uint256 i = 0; i < configuredEvents.length; i++) {
            if (configuredEvents[i] == EventType.Volatility) {
                (bool v, EventType e, ) = checkVolatility(_price);
                if (v) {
                    triggeredEvents[i] = e;
                }
            } else if (configuredEvents[i] == EventType.Staleness) {
                (bool s, EventType e) = checkStaleness(_timeStamp);
                if (s) {
                    triggeredEvents[i] = e;
                }
            } else if (configuredEvents[i] == EventType.Limit) {
                (bool l, EventType e) = checkLimit(_price);
                if (l) {
                    triggeredEvents[i] = e;
                }
            }
        }
        if (triggeredEvents.length > 0) {
            return (true, triggeredEvents);
        }
        return (false, triggeredEvents);
    }

    /**
     * @notice Custom function to be called by the keeper.
     */
    function customFunction() public onlyContract {
        externalContract.call(functionSelector);
    }

    /**
     * @notice Set custom function.
     * @param _externalContract The address of the external contract.
     * @param _functionSelector The function selector of the external contract.
     */
    function setCustomFunction(
        address _externalContract,
        bytes memory _functionSelector
    ) external onlyOwner {
        externalContract = _externalContract;
        functionSelector = _functionSelector;
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

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        whenNotPaused
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        (int256 price, uint256 timestamp) = getLatestPrice();

        (bool needed, ) = checkEvents(price, timestamp);
        upkeepNeeded = needed;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override whenNotPaused {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        (bool upkeepNeeded, EventType[] memory e) = checkEvents(
            price,
            timeStamp
        );
        if (upkeepNeeded) {
            for (uint256 i = 0; i < e.length; i++) {
                if (e[i] == EventType.Volatility) {
                    (, int256 pc) = (calculateChange(price));
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
