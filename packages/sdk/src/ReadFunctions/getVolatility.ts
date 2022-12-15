export const getVolatility = async (contract: any) => {
  try {
    const currentPrice = await contract.currentPrice();
    const volatilityPercentage = await contract.volatilityPercentage();
    return { currentPrice, volatilityPercentage };
  } catch (error) {
    throw new Error(
      `Error getting the volatility current price and volatility percentage. Reason: ${error.message}`
    );
  }
};
