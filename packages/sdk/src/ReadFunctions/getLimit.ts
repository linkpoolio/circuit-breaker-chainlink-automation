export const getLimit = async (contract: any): Promise<number> => {
  try {
    const limit = await contract.limit();
    return limit;
  } catch (error: any) {
    throw new Error(`Error getting the limit. Reason: ${error.message}`);
  }
};
