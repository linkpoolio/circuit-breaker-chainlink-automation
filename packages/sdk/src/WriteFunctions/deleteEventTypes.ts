const parseEventTypes = (eventTypes: string): number[] => {
  try {
    return JSON.parse(eventTypes);
  } catch (error: any) {
    throw new Error(
      `Error parsing the event types: ${eventTypes}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};

export const deleteEventTypes = async (contract: any, eventTypes: string) => {
  try {
    await contract.deleteEventTypes(parseEventTypes(eventTypes));
  } catch (error: any) {
    throw new Error(
      `Error deleting the event types: ${eventTypes}. Reason: ${
        error.message + JSON.stringify(error.data?.data?.stack)
      }`
    );
  }
};
