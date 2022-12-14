import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { setStaleness } from "sdk/src/WriteFunctions/setStaleness";

function SetStaleness() {
  const [contractAddress, setContractAddress] = useState("");
  const [interval, setInterval] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handleSetStaleness() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      setStaleness(contract, Number(interval)).catch((error) => {
        setErroMessage(JSON.stringify(error));
      });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Set Staleness</h2>
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
          value={interval}
          placeholder="interval (uint256)"
          onChange={(e) => setInterval(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleSetStaleness}>Set Staleness</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>{" "}
      </div>
    </div>
  );
}

export default SetStaleness;
