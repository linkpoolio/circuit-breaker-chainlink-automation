import { useState } from "react";
import { getFunctionSelector } from "sdk/src/lib/utils";

function EncodeFunctionSelector() {
  const [functionName, setFunctionName] = useState("");
  const [paramTypes, setParamTypes] = useState("");
  const [paramValues, setParamValues] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");

  const [errorMessage, setErroMessage] = useState("");

  async function handleGetFunctionSelector() {
    setErroMessage("");
    setFunctionSelector("");
    try {
      setFunctionSelector(
        getFunctionSelector(functionName, paramTypes, paramValues)
      );
    } catch (error) {
      console.log(error);
      setErroMessage(error.message);
    }
  }

  console.log(paramTypes);

  return (
    <div className="container">
      <div className="row">
        <h2>Encode Function Selector</h2>
      </div>
      <div className="row">
        <p>
          Encode the function selector in order to set the custom function for
          the circuit breaker. <br />
          <br />
          Example:
          <br />
          <br />
          <span className="code">
            function setNumber(uint256 _number, string _word)
          </span>
        </p>
      </div>
      <div className="row">
        <input
          type="string"
          value={functionName}
          placeholder="setNumber"
          onChange={(e) => setFunctionName(e.target.value)}
        />
      </div>
      <div className="row">
        <input
          type="string"
          value={paramTypes}
          placeholder='["uint256", "string"]'
          onChange={(e) => setParamTypes(e.target.value)}
        />
      </div>
      <div className="row">
        <input
          type="string"
          value={paramValues}
          placeholder='[777, "test"]'
          onChange={(e) => setParamValues(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleGetFunctionSelector}>
          Get Function Selector
        </button>
      </div>
      <div className="row">
        <p>Function Selector: {functionSelector}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default EncodeFunctionSelector;
