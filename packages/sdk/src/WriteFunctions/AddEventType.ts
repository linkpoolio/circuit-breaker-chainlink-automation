export const addEventType = async (contract: any, eventType: number) => {
  await contract.addEventType(eventType);
};
