import React from "react";
import { storiesOf } from "@storybook/react";
import GetPaused from "../src/components/ReadFunctions/GetPaused";

storiesOf("Get Paused", module).add("return paused flag", () => <GetPaused />);
