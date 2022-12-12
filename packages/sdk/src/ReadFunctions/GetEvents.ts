import { EventType } from "../lib/const";

export const getEvents = async (contract: any): Promise<string> => {
  const eventTypes = await contract.getEvents();
  return eventTypes
    .map((eventType: EventType) => EventType[eventType])
    .join(", ");
};
