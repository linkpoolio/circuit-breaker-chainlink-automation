import React from "react";
import { storiesOf } from "@storybook/react";
import SetPause from "../src/components/WriteFunctions/SetPause";
import GetPauseStatus from "../src/components/ReadFunctions/GetPauseStatus";

storiesOf("Pause", module).add("Pause, unpause or get pause status", () => (
  <div style={{ display: "flex" }}>
    <SetPause /> <GetPauseStatus />
  </div>
));
