// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CircuitBreaker is AutomationCompatibleInterface {
    address public owner;
    uint8 public limit;
    uint256 public currentPrice;
    uint256 public interval;
    uint256 public lastRoundUpdated;
    AggregatorV3Interface internal priceFeed;
    EventType[] public configuredEvents;

    enum EventType {
        Limit,
        Staleness,
        Volatility,
        None
    }

    //------------------------------ EVENTS ----------------------------------

    event Limit(uint8 percentage);
    event Staleness(uint256 interval);
    event Volatility(
        uint256 indexed percentage,
        uint256 indexed currentPrice,
        uint256 indexed lastPrice
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

    function setLimit(uint8 _limit) external onlyOwner {
        limit = _limit;
        emit Limit(limit);
    }

    function setStaleness(uint256 _interval) external onlyOwner {
        interval = _interval;
        emit Staleness(interval);
    }

    function setVolatility(uint256 _currentPrice) external onlyOwner {
        currentPrice = _currentPrice;
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
        (bool v, uint256 pc) = (calculateChange(_price));
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
        if (uint256(_price) > currentPrice) {
            return (true, EventType.Limit);
        }
        return (false, EventType.Limit);
    }

    // (new_value - original_value) / |original_value| * 100
    function calculateChange(int256 price)
        internal
        view
        returns (bool, uint256)
    {
        if (uint256(price) >= currentPrice) {
            uint256 priceDiff = uint256(price) - currentPrice;
            uint256 percentage = (priceDiff * 100) / currentPrice;
            if (percentage > limit) {
                return (true, percentage);
            }
        } else {
            uint256 priceDiff = currentPrice - uint256(price);
            uint256 percentage = (priceDiff * 100) / uint256(price);
            if (percentage > limit) {
                return (true, percentage);
            }
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

        (bool upkeepNeeded, ) = checkEvents(price, timestamp);
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        (bool upkeepNeeded, EventType e) = checkEvents(price, timeStamp);
        if (upkeepNeeded) {
            if (e == EventType.Volatility) {
                (bool v, uint256 pc) = (calculateChange(price));
                emit Volatility(pc, uint256(price), currentPrice);
            } else if (e == EventType.Staleness) {
                emit Staleness(interval);
            } else if (e == EventType.Limit) {
                emit Limit(limit);
            }
        }
        // DO SOMETHING | User defined function
    }
}
