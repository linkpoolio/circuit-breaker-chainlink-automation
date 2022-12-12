import React from "react";
import { storiesOf } from "@storybook/react";
import GetEvents from "../src/components/ReadFunctions/GetEvents";

storiesOf("Get Events", module).add("return events", () => <GetEvents />);
