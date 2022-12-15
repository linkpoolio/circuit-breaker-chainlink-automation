import { storiesOf } from "@storybook/react";
import EncodeFunctionSelector from "../src/components/Utils/EncodeFunctionSelector";
import SetCustomFunction from "../src/components/WriteFunctions/SetCustomFunction";
import SetPauseCustomFunction from "../src/components/WriteFunctions/SetPauseCustomFunction";
import GetCustomFunction from "../src/components/ReadFunctions/GetCustomFunction";

storiesOf("Custom Function", module).add(
  "Set, pause or unpause custom function.",
  () => (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <SetCustomFunction />
      <SetPauseCustomFunction />
      <GetCustomFunction />
      <EncodeFunctionSelector />
    </div>
  )
);
