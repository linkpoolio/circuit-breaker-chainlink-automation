import { storiesOf } from "@storybook/react";
import GetEventTypes from "../src/components/ReadFunctions/GetEventTypes";
import AddEventTypes from "../src/components/WriteFunctions/AddEventTypes";
import DeleteEventTypes from "../src/components/WriteFunctions/DeleteEventTypes";

storiesOf("Event Types", module).add("Add, delete or get event types.", () => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <AddEventTypes />
    <DeleteEventTypes />
    <GetEventTypes />
  </div>
));
