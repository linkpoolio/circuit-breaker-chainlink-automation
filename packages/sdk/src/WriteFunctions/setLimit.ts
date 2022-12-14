export const setLimit = async (contract: any, limit: number) => {
  await contract.setLimit(limit);
};
