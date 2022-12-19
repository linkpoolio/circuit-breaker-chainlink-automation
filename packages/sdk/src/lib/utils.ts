import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { FUNCTION_NAME_PREFIX_FOR_INTERFACE } from "./const";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const getContract = (contractAddress: string, contractAbi: any) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractAbi, signer);
  } catch (error: any) {
    throw new Error(`Error initiating the contract. Reason: ${error.message}`);
  }
};

export const parseParamTypes = (paramTypes: string) => {
  try {
    return paramTypes === "" ? [] : JSON.parse(paramTypes);
  } catch (error: any) {
    throw new Error(
      `Error parsing the parameter types: ${paramTypes}. Reason: ${error.message} `
    );
  }
};

export const parseParamValues = (paramValues: string) => {
  try {
    return paramValues === "" ? [] : JSON.parse(paramValues);
  } catch (error: any) {
    throw new Error(
      `Error parsing the parameter values: ${paramValues}. Reason: ${error.message} `
    );
  }
};

export const parseName = (name: string) => {
  if (name.length !== 0) {
    return name;
  }
  throw new Error(
    `Error parsing the function name: ${name}. The function name can't be empty. `
  );
};

export const encodeFunctionSelector = (
  name: string,
  paramTypes: string,
  paramValues: string
) => {
  try {
    const functionName = `${parseName(name)}(${parseParamTypes(
      paramTypes
    ).join()})`;
    if (paramValues.length === 0) {
      const buffer = Buffer.from(functionName);
      const functionSelector = ethers.utils
        .keccak256(`0x${buffer.toString("hex")}`)
        .slice(0, 10);
      return functionSelector;
    }
    const iface = new ethers.utils.Interface([
      FUNCTION_NAME_PREFIX_FOR_INTERFACE + functionName,
    ]);
    const functionSelector = iface.encodeFunctionData(
      name,
      parseParamValues(paramValues)
    );
    return functionSelector;
  } catch (error: any) {
    throw new Error(
      `Error getting the function selector. Reason: ${error.message}`
    );
  }
};
