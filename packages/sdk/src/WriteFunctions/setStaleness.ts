export const setStaleness = async (contract: any, interval: number) => {
  try {
    await contract.setStaleness(interval);
  } catch (error) {
    throw new Error(
      `Error setting the staleness interval ${interval}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
