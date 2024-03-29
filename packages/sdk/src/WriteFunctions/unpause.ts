export const unpause = async (contract: any) => {
  try {
    await contract.unpause();
  } catch (error: any) {
    throw new Error(
      `Error unpausing the contract. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
