import React from "react";
import { storiesOf } from "@storybook/react";
import SetPause from "../src/components/WriteFunctions/SetPause";

storiesOf("Set Pause", module).add("pause or unpause contract", () => (
  <SetPause />
));
