import { storiesOf } from "@storybook/react";
import SetStaleness from "../src/components/WriteFunctions/SetStaleness";
import GetStaleness from "../src/components/ReadFunctions/GetStaleness";

storiesOf("Staleness", module).add("Set or get staleness interval", () => (
  <div style={{ display: "flex" }}>
    <SetStaleness /> <GetStaleness />
  </div>
));
