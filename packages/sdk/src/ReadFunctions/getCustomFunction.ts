export const getCustomFunction = async (contract: any) => {
  try {
    const externalContract = await contract.externalContract();
    const functionSelector = await contract.functionSelector();
    return { externalContract, functionSelector };
  } catch (error) {
    throw new Error(
      `Error getting the custom function's externalContract and functionSelector. Reason: ${error.message}`
    );
  }
};
