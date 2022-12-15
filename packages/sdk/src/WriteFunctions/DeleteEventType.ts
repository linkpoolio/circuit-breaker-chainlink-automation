export const deleteEventType = async (contract: any, eventType: number) => {
  try {
    await contract.deleteEventType(eventType);
  } catch (error) {
    throw new Error(
      `Error deleting the event type: ${eventType}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
