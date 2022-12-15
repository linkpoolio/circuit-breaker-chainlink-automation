export const addEventType = async (contract: any, eventType: number) => {
  try {
    await contract.addEventType(eventType);
  } catch (error) {
    throw new Error(
      `Error adding the event type: ${eventType}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
