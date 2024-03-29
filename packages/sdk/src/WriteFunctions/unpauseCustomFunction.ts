export const unpauseCustomFunction = async (contract: any) => {
  try {
    await contract.unpauseCustomFunction();
  } catch (error: any) {
    throw new Error(
      `Error unpausing the custom function. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
