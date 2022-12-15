import { storiesOf } from "@storybook/react";
import GetEventTypes from "../src/components/ReadFunctions/GetEventTypes";
import AddEventType from "../src/components/WriteFunctions/AddEventType";
import DeleteEventType from "../src/components/WriteFunctions/DeleteEventType";

storiesOf("Event Types", module).add("Add, delete or get event types.", () => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <AddEventType />
    <DeleteEventType />
    <GetEventTypes />
  </div>
));
