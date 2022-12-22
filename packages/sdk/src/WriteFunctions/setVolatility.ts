const parseCurrentPrice = (currentPrice: string): number => {
  try {
    return parseInt(currentPrice);
  } catch (error: any) {
    throw new Error(
      `Error parsing the current price: ${currentPrice}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};

const parsePercentage = (percentage: string): number => {
  try {
    return parseInt(percentage);
  } catch (error: any) {
    throw new Error(
      `Error parsing the percentage: ${percentage}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};

export const setVolatility = async (
  contract: any,
  currentPrice: string,
  percentage: string
) => {
  try {
    await contract.setVolatility(
      parseCurrentPrice(currentPrice),
      parsePercentage(percentage)
    );
  } catch (error: any) {
    throw new Error(
      `Error setting the volatility currentPrice: ${currentPrice} and percentage ${percentage}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
