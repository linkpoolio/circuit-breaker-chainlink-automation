export const getPaused = async (contract: any): Promise<boolean> => {
  const isPaused = await contract.isPaused();
  return isPaused;
};
