export const setVolatility = async (
  contract: any,
  currentPrice: number,
  percentage: number
) => {
  await contract.setVolatility(currentPrice, percentage);
};
