export const setCustomFunction = async (
  contract: any,
  address: string,
  functionSelector: string
) => {
  try {
    await contract.setCustomFunction(address, functionSelector);
  } catch (error) {
    throw new Error(
      `Error setting the custom function with address: ${address} and functionSelector: ${functionSelector}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
