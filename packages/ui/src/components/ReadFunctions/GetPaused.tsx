import React, { useState } from "react";
import { getContract } from "../../lib/utils";
import CircuitBreaker from "../../abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";

function GetPaused() {
  const [contractAddress, setContractAddress] = useState("");
  const [paused, setPaused] = useState(null);

  const contract = getContract(contractAddress, CircuitBreaker);

  async function handleGetPaused() {
    const result = await contract.isPaused();
    console.log(paused);
    setPaused(result);
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
      <h1>Get Paused</h1>
      <input
        type="string"
        value={contractAddress}
        placeholder="contractAddress(address)"
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <button onClick={handleGetPaused}>Get Events</button>
      <p>Paused: {paused}</p>
    </div>
  );
}

export default GetPaused;
