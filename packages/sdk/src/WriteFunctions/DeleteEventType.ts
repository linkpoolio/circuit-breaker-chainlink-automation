export const deleteEventType = async (contract: any, eventType: number) => {
  await contract.deleteEventType(eventType);
};
