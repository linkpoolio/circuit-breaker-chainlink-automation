import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { setLimit } from "sdk/src/WriteFunctions/setLimit";

function SetLimit() {
  const [contractAddress, setContractAddress] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handleSetLimit() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      setLimit(contract, Number(limitInput)).catch((error) => {
        setErroMessage(JSON.stringify(error));
      });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Set Limit</h2>
      </div>
      <div className="row">
        <input
          type="string"
          value={contractAddress}
          placeholder="contractAddress (address)"
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>
      <div className="row">
        <input
          type="number"
          value={limitInput}
          placeholder="limit (int256)"
          onChange={(e) => setLimitInput(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleSetLimit}>Set Limit</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>{" "}
      </div>
    </div>
  );
}

export default SetLimit;
