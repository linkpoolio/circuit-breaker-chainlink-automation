export const setStaleness = async (contract: any, interval: number ) => {
    await contract.setStaleness(interval);
  };
