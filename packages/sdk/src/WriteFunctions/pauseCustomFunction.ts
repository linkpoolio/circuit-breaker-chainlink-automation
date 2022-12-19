export const pauseCustomFunction = async (contract: any) => {
  try {
    await contract.pauseCustomFunction();
  } catch (error: any) {
    throw new Error(
      `Error pausing the custom function. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
