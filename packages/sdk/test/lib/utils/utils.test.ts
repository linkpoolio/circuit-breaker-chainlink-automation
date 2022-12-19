import { expect } from "chai";
import { encodeFunctionSelector } from "../../../src/lib/utils";

describe("encodeFunctionSelector", () => {
  it("should return the expected function selector given the input parameters", () => {
    const name = "myMethod";
    const paramTypes = '["uint256"]';
    const paramValues = "[77]";
    const expectedFunctionSelector =
      "0x58cf5f10000000000000000000000000000000000000000000000000000000000000004d";

    const functionSelector = encodeFunctionSelector(
      name,
      paramTypes,
      paramValues
    );
    expect(functionSelector).to.equal(expectedFunctionSelector);
  });
  it("should return the expected function selector given the input parameters (case with complex struct)", () => {
    const name = "myMethod";
    const paramTypes = '[ "uint a", "tuple(uint256 b, string c) d" ]';
    const paramValues = '[1234, { "b": 5678, "c": "Hello World" } ]';
    const expectedFunctionSelector =
      "0x90ded7ac00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000162e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000";

    const functionSelector = encodeFunctionSelector(
      name,
      paramTypes,
      paramValues
    );
    expect(functionSelector).to.equal(expectedFunctionSelector);
  });
});
