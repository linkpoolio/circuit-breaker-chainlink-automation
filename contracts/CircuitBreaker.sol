// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CircuitBreaker is AutomationCompatibleInterface {
    bool public stopped = false;
    address public owner;
    uint8 public limit;
    uint256 public currentPrice;
    uint256 public interval;
    uint256 public lastRoundUpdated;
    AggregatorV3Interface internal priceFeed;

    event Limit(uint8 percentage);
    event Staleness(uint256 interval);
    event Volatility(
        uint256 indexed percentage,
        uint256 indexed currentPrice,
        uint256 indexed lastPrice
    );

    constructor(
        address _feed,
        uint8 _limit,
        uint256 _interval,
        uint256 _price
    ) {
        owner = msg.sender;
        lastRoundUpdated = block.timestamp;
        priceFeed = AggregatorV3Interface(_feed);
    }

    function setLimit(uint8 _limit) public {
        require(msg.sender == owner, "Only owner can set limit");
        limit = _limit;
        emit Limit(limit);
    }

    function setStaleness(uint256 _interval) public {
        require(msg.sender == owner, "Only owner can set staleness");
        interval = _interval;
        emit Staleness(interval);
    }

    function setVolatility(uint256 _currentPrice) public {
        require(msg.sender == owner, "Only owner can set volatility");
        currentPrice = _currentPrice;
    }

    function updateFeed(address _feed) public {
        require(msg.sender == owner, "Only owner can update feed");
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

    function checkVolatility(int256 _price) internal returns (bool) {
        (bool v, uint256 pc) = (calculateChange(_price));
        if (v) {
            emit Volatility(pc, uint256(_price), currentPrice);
            return true;
        }

        return false;
    }

    function checkStaleness() internal returns (bool) {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        if (block.timestamp - timeStamp > interval) {
            return true;
        }
        emit Staleness(interval);
        return false;
    }

    function checkLimit() internal returns (bool) {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        if (uint256(price) > currentPrice) {
            return true;
        }
        emit Limit(limit);
        return false;
    }

    // (new_value - original_value) / |original_value| * 100
    function calculateChange(int256 price) internal returns (bool, uint256) {
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

        if (timestamp - lastRoundUpdated > interval) {
            upkeepNeeded = true;
        }
        uint256 priceDiff = uint256(price) - currentPrice;
        uint256 percentage = (priceDiff * 100) / currentPrice;
        upkeepNeeded = percentage > limit;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (int256 price, uint256 timeStamp) = getLatestPrice();
        if (checkStaleness() || checkVolatility(price) || checkLimit()) {
            // DO SOMETHING
        }
    }
}
