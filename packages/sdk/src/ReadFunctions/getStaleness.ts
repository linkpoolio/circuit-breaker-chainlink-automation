export const getStaleness = async (contract: any): Promise<number> => {
  try {
    const interval = await contract.interval();
    return interval;
  } catch (error) {
    throw new Error(
      `Error getting the staleness interval. Reason: ${error.message}`
    );
  }
};
