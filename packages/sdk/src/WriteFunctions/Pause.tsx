export const pause = async (contract: any) => {
  try {
    await contract.pause();
  } catch (error: any) {
    throw new Error(
      `Error pausing the contract. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
