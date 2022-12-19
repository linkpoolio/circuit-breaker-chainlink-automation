export const deleteEventTypes = async (contract: any, eventTypes: number[]) => {
  try {
    await contract.deleteEventTypes(eventTypes);
  } catch (error: any) {
    throw new Error(
      `Error deleting the event types: ${eventTypes}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
