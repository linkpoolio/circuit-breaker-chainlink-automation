import React, { useState } from "react";
import { getContract } from "../../lib/utils";
import CircuitBreaker from "../../abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";

function AddEventType() {
  const [contractAddress, setContractAddress] = useState("");
  const [eventType, setEventType] = useState("");

  const contract = getContract(contractAddress, CircuitBreaker);

  async function handleAddEventType() {
    await contract.addEventType(Number(eventType));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "30%",
        marginBottom: "5px",
      }}
    >
      <h1>Add Event Type</h1>
      <input
        type="string"
        value={contractAddress}
        placeholder="contractAddress (address)"
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <input
        type="number"
        value={eventType}
        placeholder="eventType (uint8)"
        onChange={(e) => setEventType(e.target.value)}
      />

      <button onClick={handleAddEventType}>Add Event Types</button>
    </div>
  );
}

export default AddEventType;
