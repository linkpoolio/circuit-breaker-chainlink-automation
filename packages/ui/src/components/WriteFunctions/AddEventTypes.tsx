import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { addEventTypes } from "sdk/src/WriteFunctions/addEventTypes";

function AddEventTypes() {
  const [contractAddress, setContractAddress] = useState("");
  const [eventTypes, setEventTypes] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handleAddEventType() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      addEventTypes(contract, eventTypes).catch((error: any) => {
        setErroMessage(error.message);
      });
    } catch (error: any) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Add Event Types</h2>
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
          type="string"
          value={eventTypes}
          placeholder="eventTypes (uint8[])"
          onChange={(e) => setEventTypes(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleAddEventType}>Add Event Types</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default AddEventTypes;
