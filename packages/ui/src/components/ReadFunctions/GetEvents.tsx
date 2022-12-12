import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getEvents } from "sdk/src/ReadFunctions/GetEvents";
import "../../styles/main.css";

function GetEvents() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [events, setEvents] = useState("");

  async function handleGetEvents() {
    setEvents("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getEvents(contract)
        .then((res) => {
          setEvents(res);
        })
        .catch((error) => {
          setErroMessage(error.message);
        });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Get Events</h2>
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
        <button onClick={handleGetEvents}>Get Events</button>
      </div>
      <div className="row">
        <p>Events: {events}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>{" "}
      </div>
    </div>
  );
}

export default GetEvents;
