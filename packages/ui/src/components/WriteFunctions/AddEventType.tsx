import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { addEventType } from "sdk/src/WriteFunctions/addEventType";

function AddEventType() {
  const [contractAddress, setContractAddress] = useState("");
  const [eventType, setEventType] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handleAddEventType() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      addEventType(contract, Number(eventType)).catch((error) => {
        setErroMessage(error.message);
      });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Add Event Type</h2>
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
        <button onClick={handleAddEventType}>Add Event Type</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default AddEventType;
