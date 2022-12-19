import { useState } from "react";
import { encodeFunctionSelector } from "sdk/src/lib/utils";

function EncodeFunctionSelector() {
  const [functionName, setFunctionName] = useState("");
  const [paramTypes, setParamTypes] = useState("");
  const [paramValues, setParamValues] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");

  const [errorMessage, setErroMessage] = useState("");

  async function handleEncodeFunctionSelector() {
    setErroMessage("");
    setFunctionSelector("");
    try {
      setFunctionSelector(
        encodeFunctionSelector(functionName, paramTypes, paramValues)
      );
    } catch (error) {
      setErroMessage(error.message);
    }
  }

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
        <button onClick={handleEncodeFunctionSelector}>
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
