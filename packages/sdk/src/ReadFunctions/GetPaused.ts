
export const getPaused = async (
  contract: any
): Promise<boolean> => {
  try {
    const isPaused = await contract.isPaused();
    return isPaused;
  } catch (error: any) {
    throw new Error(`Error getting the pause status. Reason: ${error.message}`);
  }
};
