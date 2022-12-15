export const getLimit = async (contract: any): Promise<number> => {
  try {
    const limit = await contract.limit();
    return limit;
  } catch (error) {
    throw new Error(`Error getting the limit. Reason: ${error.message}`);
  }
};
