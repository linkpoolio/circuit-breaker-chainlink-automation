export const addEventTypes = async (contract: any, eventTypes: number[]) => {
  try {
    await contract.addEventTypes(eventTypes);
  } catch (error: any) {
    throw new Error(
      `Error adding the event types: ${eventTypes}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
