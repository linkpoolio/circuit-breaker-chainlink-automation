const parseLimit = (limit: string): number => {
  try {
    return parseInt(limit);
  } catch (error: any) {
    throw new Error(
      `Error parsing the limit: ${limit}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};

export const setLimit = async (contract: any, limit: string) => {
  try {
    await contract.setLimit(parseLimit(limit));
  } catch (error: any) {
    throw new Error(
      `Error setting the limit: ${limit}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
