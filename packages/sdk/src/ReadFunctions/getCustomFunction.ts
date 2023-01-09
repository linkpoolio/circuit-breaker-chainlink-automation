export const getExternalContractAndFunctionSelector = async (
  contract: any
): Promise<{ contractAddress: string; functionSignature: string }> => {
  try {
    const contractAddress = await contract.getExternalContract();
    const functionSignature = await contract.getFunctionSelector();
    return { contractAddress, functionSignature };
  } catch (error: any) {
    throw new Error(
      `Error getting the custom function's contract address and function signature. Reason: ${error.message}`
    );
  }
};
