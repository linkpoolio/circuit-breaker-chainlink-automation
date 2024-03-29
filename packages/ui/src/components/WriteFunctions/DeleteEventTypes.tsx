import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { deleteEventTypes } from "sdk/src/WriteFunctions/deleteEventTypes";

function DeleteEventTypes() {
  const [contractAddress, setContractAddress] = useState("");
  const [eventTypes, setEventTypes] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handleDeleteEventType() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      deleteEventTypes(contract, JSON.parse(eventTypes)).catch((error: any) => {
        setErroMessage(error.message);
      });
    } catch (error: any) {
      setErroMessage(error.message + JSON.stringify(error.data.data));
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Delete Event Types</h2>
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
          value={eventTypes}
          placeholder="eventTypes (uint8[])"
          onChange={(e) => setEventTypes(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleDeleteEventType}>Delete Event Types</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default DeleteEventTypes;
