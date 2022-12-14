export const getStaleness = async (contract: any): Promise<number> => {
  const interval = await contract.interval();
  return interval;
};
