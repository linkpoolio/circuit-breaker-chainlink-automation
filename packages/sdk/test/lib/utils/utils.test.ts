import { expect } from "chai"
import { getFunctionSelector } from "../../../src/lib/utils";

describe("getFunctionSelector", () => {
  it("should return the expected function selector given the input parameters", () => {
    const name = "myMethod";
    const paramTypes = '["uint256"]';
    const paramValues = "[77]";
    const expectedFunctionSelector =
      "0x58cf5f10000000000000000000000000000000000000000000000000000000000000004d";

    const functionSelector = getFunctionSelector(name, paramTypes, paramValues);
    expect(functionSelector).to.equal(expectedFunctionSelector);
  });
});
