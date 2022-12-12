import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { pause } from "sdk/src/ReadFunctions/GetPaused";

function Pause() {
  const [contractAddress, setContractAddress] = useState("");
  const [eventType, setEventType] = useState("");
  const [errorMessage, setErroMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function handleDeleteEventType() {
    setSuccess("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      await contract.pause().catch((error) => {
        setErroMessage(JSON.stringify(error));
      });
    } catch (error) {
      setErroMessage(error.message + JSON.stringify(error.data.data));
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Delete Event Type</h2>
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
          value={eventType}
          placeholder="eventType (uint8)"
          onChange={(e) => setEventType(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleDeleteEventType}>Delete Event Type</button>
      </div>
      <div className="row">
        <p>Status: {success}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>{" "}
      </div>
    </div>
  );
}

export default Pause;
