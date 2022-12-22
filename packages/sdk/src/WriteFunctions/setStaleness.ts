const parseInterval = (interval: string): number => {
  try {
    return parseInt(interval);
  } catch (error: any) {
    throw new Error(
      `Error parsing the staleness interval: ${interval}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};

export const setStaleness = async (contract: any, interval: string) => {
  try {
    await contract.setStaleness(parseInterval(interval));
  } catch (error: any) {
    throw new Error(
      `Error setting the staleness interval ${interval}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
