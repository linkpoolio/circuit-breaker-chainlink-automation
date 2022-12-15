export const setLimit = async (contract: any, limit: number) => {
  try {
    await contract.setLimit(limit);
  } catch (error) {
    throw new Error(
      `Error setting the limit: ${limit}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
