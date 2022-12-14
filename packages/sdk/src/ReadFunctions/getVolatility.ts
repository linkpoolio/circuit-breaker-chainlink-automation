export const getVolatility = async (contract: any) => {
  const currentPrice = await contract.currentPrice();
  const volatilityPercentage = await contract.volatilityPercentage();
  return { currentPrice, volatilityPercentage };
};
