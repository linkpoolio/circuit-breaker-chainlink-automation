// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

interface ICircuitBreaker {
    function getEvents() external view returns (uint8[] memory);
    function addEventTypes(uint8[] memory eventTypes) external;
    function deleteEventTypes(uint8[] memory eventTypes) external;
    function customFunction() external;

    function setCustomFunction(address externalContractAddress, bytes memory functionSelectorHex) external;
    function setKeeperRegistryAddress(address newKeeperRegistryAddress) external;
    function setVolatility(int256 newPrice, uint256 newPercentage) external;
    function setStaleness(uint256 newInterval) external;
    function setLimit(uint256 newLowLimit, uint256 newHighLimit) external;
    function updateFeed(address feed) external;

    function pauseCustomFunction() external;
    function unpauseCustomFunction() external;
    function isCustomFunctionPaused() external view returns (bool);

    function pause() external;
    function unpause() external;
    function isPaused() external view returns (bool);
}
