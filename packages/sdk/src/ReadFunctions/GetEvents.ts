import { EventType } from "../lib/const";

export const getEvents = async (contract: any): Promise<string> => {
  try {
    const eventTypes = await contract.getEvents();
    return eventTypes
      .map((eventType: EventType) => EventType[eventType])
      .join(", ");
  } catch (error) {
    throw new Error(`Error getting event types. Reason: ${error.message}`);
  }
};
