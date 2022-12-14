import React from "react";
import { storiesOf } from "@storybook/react";
import SetLimit from "../src/components/WriteFunctions/SetLimit";
import GetLimit from "../src/components/ReadFunctions/GetLimit";

storiesOf("Limit", module).add("Set or get limit", () => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <SetLimit />
    <GetLimit />
  </div>
));
