import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getPaused } from "../../../../sdk/src/ReadFunctions/getPaused";
import "../../styles/main.css";

function GetPauseStatus() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [isPaused, setIsPaused] = useState("");

  async function handleGetPaused() {
    setIsPaused("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getPaused(contract)
        .then((res) => {
          setIsPaused(String(res));
        })
        .catch((error) => {
          setErroMessage(JSON.stringify(error));
        });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  console.log(isPaused);

  return (
    <div className="container">
      <div className="row">
        <h2>Get Pause Status</h2>
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
        <button onClick={handleGetPaused}>Get Paused</button>
      </div>
      <div className="row">
        <p>Is paused: {isPaused}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default GetPauseStatus;
