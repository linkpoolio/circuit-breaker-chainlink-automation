import React from "react";
import { storiesOf } from "@storybook/react";
import SetVolatility from "../src/components/WriteFunctions/SetVolatility";
import GetVolatility from "../src/components/ReadFunctions/GetVolatility";

storiesOf("Volatility", module).add("Set or get volatility", () => (
  <div style={{ display: "flex" }}>
    <SetVolatility /> <GetVolatility />
  </div>
));
