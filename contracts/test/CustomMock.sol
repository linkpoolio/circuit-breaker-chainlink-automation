// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

contract CustomMock {
    string public name;
    uint256 public num;

    constructor() {}

    function test(uint256 _num1) public {
        num = _num1;
    }
}
