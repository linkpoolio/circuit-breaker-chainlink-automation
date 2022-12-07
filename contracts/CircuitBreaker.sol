// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CircuitBreaker is AutomationCompatibleInterface {
    address public owner;
    int256 public limit;
    int256 public currentPrice;
    int8 public volatilityPercentage;
    uint256 public interval;
    uint256 public lastRoundUpdated;
    address public externalContract;
    bytes public functionSelector;
    bool public usingExternalContract;
    AggregatorV3Interface public priceFeed;
    EventType[] public configuredEvents;

    enum EventType {
        Limit,
        Staleness,
        Volatility,
        None
    }

    //------------------------------ EVENTS ----------------------------------

    event Limit(int256 percentage);
    event Staleness(uint256 interval);
    event Volatility(
        int256 indexed percentage,
        uint256 indexed currentPrice,
        int256 indexed lastPrice
    );

    // ------------------- MODIFIERS -------------------

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        address _feed,
        uint8 _limit,
        uint256 _interval,
        uint256 _price,
        uint8[] memory _eventTypes
    ) {
        owner = msg.sender;
        lastRoundUpdated = block.timestamp;
        priceFeed = AggregatorV3Interface(_feed);
        for (uint256 i = 0; i < _eventTypes.length; i++) {
            configuredEvents.push(EventType(_eventTypes[i]));
        }
    }

    function getEvents() external view returns (EventType[] memory) {
        return configuredEvents;
    }

    function addEventType(uint8 _eventType) external onlyOwner {
        configuredEvents.push(EventType(_eventType));
    }

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

    function setLimit(int256 _limit) external onlyOwner {
        limit = _limit;
    }

    function setStaleness(uint256 _interval) external onlyOwner {
        interval = _interval;
    }

    function setVolatility(int256 _currentPrice, int8 _percentage)
        external
        onlyOwner
    {
        currentPrice = _currentPrice;
        volatilityPercentage = _percentage;
    }

    function updateFeed(address _feed) external onlyOwner {
        priceFeed = AggregatorV3Interface(_feed);
    }

    function getLatestPrice() internal view returns (int256, uint256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answerRound
        ) = priceFeed.latestRoundData();
        return (price, timeStamp);
    }

    function checkVolatility(int256 _price)
        internal
        view
        returns (bool, EventType)
    {
        (bool v, int256 pc) = (calculateChange(_price));
        if (v) {
            return (true, EventType.Volatility);
        }

        return (false, EventType.Volatility);
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
        if (_price > currentPrice) {
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
        int256 positiveValue = percentageChange < 0
            ? -percentageChange
            : percentageChange;
        if (positiveValue > volatilityPercentage) {
            return (true, positiveValue);
        }

        return (false, 0);
    }

    function checkEvents(int256 _price, uint256 _timeStamp)
        internal
        view
        returns (bool, EventType)
    {
        for (uint256 i = 0; i < configuredEvents.length; i++) {
            if (configuredEvents[i] == EventType.Volatility) {
                (bool v, EventType e) = checkVolatility(_price);
                if (v) {
                    return (true, e);
                }
            } else if (configuredEvents[i] == EventType.Staleness) {
                (bool s, EventType e) = checkStaleness(_timeStamp);
                if (s) {
                    return (true, e);
                }
            } else if (configuredEvents[i] == EventType.Limit) {
                (bool l, EventType e) = checkLimit(_price);
                if (l) {
                    return (true, e);
                }
            }
        }
        return (false, EventType.None);
    }

    function customFunction() public {
        externalContract.call(functionSelector);
    }

    function setCustomFunction(
        address _externalContract,
        bytes memory _functionSelector
    ) external onlyOwner {
        externalContract = _externalContract;
        functionSelector = _functionSelector;
        usingExternalContract = true;
    }

    function pauseCustomFunction() external onlyOwner {
        usingExternalContract = false;
    }

    function unpauseCustomFunction() external onlyOwner {
        usingExternalContract = true;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
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
    ) external override {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        (bool upkeepNeeded, EventType e) = checkEvents(price, timeStamp);
        if (upkeepNeeded) {
            if (e == EventType.Volatility) {
                (bool v, int256 pc) = (calculateChange(price));
                emit Volatility(pc, uint256(price), currentPrice);
            } else if (e == EventType.Staleness) {
                emit Staleness(interval);
            } else if (e == EventType.Limit) {
                emit Limit(limit);
            }
        }
        if (usingExternalContract) {
            customFunction();
        }
    }
}
