import React, { useState } from "react";
import { getContract } from "../../lib/utils";
import CircuitBreaker from "../../abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";

function GetEvents() {
  const [contractAddress, setContractAddress] = useState("");
  const [events, setEvents] = useState(false);

  const contract = getContract(contractAddress, CircuitBreaker);

  async function handleGetEvents() {
    const result = await contract.getEvents();
    setEvents(result.join(","));
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
      <h1>Get Events</h1>
      <input
        type="string"
        value={contractAddress}
        placeholder="contractAddress(address)"
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <button onClick={handleGetEvents}>Get Events</button>
      <p>Events: {events}</p>
    </div>
  );
}

export default GetEvents;
