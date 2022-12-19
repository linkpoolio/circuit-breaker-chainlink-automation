import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getStaleness } from "sdk/src/ReadFunctions/getStaleness";
import "../../styles/main.css";

function GetStaleness() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [stalenessInterval, setStalenessInterval] = useState("");

  async function handleGetStalenessInterval() {
    setStalenessInterval("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getStaleness(contract)
        .then((res) => {
          setStalenessInterval(res.toString());
        })
        .catch((error: any) => {
          setErroMessage(error.message);
        });
    } catch (error: any) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Get Staleness Interval</h2>
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
        <button onClick={handleGetStalenessInterval}>
          Get Staleness Interval
        </button>
      </div>
      <div className="row">
        <p>Interval: {stalenessInterval}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default GetStaleness;
