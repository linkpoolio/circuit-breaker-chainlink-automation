// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {AutomationRegistryInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationRegistryInterface1_2.sol";

contract CircuitBreaker is AutomationCompatibleInterface {
    address public owner;
    uint8 public limit;
    uint256 public currentPrice;
    uint256 public interval;
    uint256 public lastRoundUpdated;
    AggregatorV3Interface public priceFeed;
    AutomationRegistryInterface public registry;
    EventType[] public configuredEvents;
    uint256 public autoID;
    bool public limitEventStatus;
    bool public stalenessEventStatus;
    bool public volatilityEventStatus;

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
            if (_eventTypes[i] == 0) {
                limitEventStatus = true;
            } else if (_eventTypes[i] == 1) {
                stalenessEventStatus = true;
            } else if (_eventTypes[i] == 2) {
                volatilityEventStatus = true;
            }
            configuredEvents.push(EventType(_eventTypes[i]));
        }
    }

    function checkEventIsEnabled(uint8 _eventType)
        internal
        view
        returns (bool)
    {
        if (_eventType == 0 && limitEventStatus) {
            return true;
        } else if (_eventType == 1 && stalenessEventStatus) {
            return true;
        } else if (_eventType == 2 && volatilityEventStatus) {
            return true;
        }
        return false;
    }

    function getEvents() external view returns (EventType[] memory) {
        return configuredEvents;
    }

    /**
     * @notice adds an event type to the circuit breaker
     * @param _eventType enum of event type
     */
    function addEventType(uint8 _eventType) external onlyOwner {
        require(
            _eventType == 0 || _eventType == 1 || _eventType == 2,
            "Invalid event type"
        );
        require(!checkEventIsEnabled(_eventType), "Event type already enabled");
        configuredEvents.push(EventType(_eventType));
        updateEventTypeStatus(_eventType, true);
    }

    function updateEventTypeStatus(uint8 _eventType, bool status) internal {
        if (_eventType == 0) {
            limitEventStatus = status;
        } else if (_eventType == 1) {
            stalenessEventStatus = status;
        } else if (_eventType == 2) {
            volatilityEventStatus = status;
        }
    }

    /**
     * @notice deletes an event type from the array
     * @param _eventType enum of event type
     */
    function deleteEventType(uint8 _eventType) external onlyOwner {
        require(
            _eventType == 0 || _eventType == 1 || _eventType == 2,
            "Invalid event type"
        );
        for (uint256 i = 0; i < configuredEvents.length; i++) {
            if (configuredEvents[i] == EventType(_eventType)) {
                configuredEvents[i] = configuredEvents[
                    configuredEvents.length - 1
                ];
                configuredEvents.pop();
                updateEventTypeStatus(_eventType, false);
                break;
            }
        }
    }

    function setLimit(uint8 _limit) external onlyOwner {
        limit = _limit;
    }

    function setStaleness(uint256 _interval) external onlyOwner {
        interval = _interval;
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

    /**
     * @notice checks volatility event criteria
     * @param _price current price of the asset
     */
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

    /**
     * @notice checks staleness event criteria
     * @param _timeStamp last time the price was updated
     */
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

    /**
     * @notice checks limit event criteria
     * @param _price current price of the asset
     */
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

    /**
     * @notice checks each event helper to see if it meets the criteria
     * for triggering an event
     * @param _price current price of the asset
     * @param _timeStamp current timestamp of last price update
     */
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
        if (configuredEvents.length == 0) {
            return (false, "");
        }
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

    /**
     * @notice adds LINK funding for an upkeep by transferring from the sender's
     * LINK balance
     * @param _amount number of LINK to transfer
     */
    function addFunds(uint96 _amount) external payable {
        registry.addFunds(autoID, _amount);
    }

    /**
     * @notice adds registry contract addresses and upkeep ID to the contract
     * @param _address address of the registry
     * @param _id id of the upkeep
     */
    function addAutomationRegistry(address _address, uint256 _id)
        external
        onlyOwner
    {
        registry = AutomationRegistryInterface(_address);
        autoID = _id;
    }

    /**
     * @notice returns upkeep LINK balance
     */
    function getUpkeepBalance() external view returns (uint256) {
        (
            address target,
            uint32 executeGas,
            bytes memory checkData,
            uint96 balance,
            address lastKeeper,
            address admin,
            uint64 maxValidBlocknumber,
            uint96 amountSpent
        ) = registry.getUpkeep(autoID);
        return balance;
    }
}
