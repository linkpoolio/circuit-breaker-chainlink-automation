export const setVolatility = async (
  contract: any,
  currentPrice: number,
  percentage: number
) => {
  try {
    await contract.setVolatility(currentPrice, percentage);
  } catch (error: any) {
    throw new Error(
      `Error setting the volatility currentPrice: ${currentPrice} and percentage ${percentage}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
