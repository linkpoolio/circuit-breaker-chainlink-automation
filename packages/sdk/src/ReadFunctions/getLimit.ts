export const getLimit = async (contract: any): Promise<number> => {
    const limit = await contract.limit();
    return limit;
  };
