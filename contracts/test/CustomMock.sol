// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

contract CustomMock {
    uint256 public num;

    constructor() {}

    function test(uint256 num1) external {
        num = num1;
    }
}
