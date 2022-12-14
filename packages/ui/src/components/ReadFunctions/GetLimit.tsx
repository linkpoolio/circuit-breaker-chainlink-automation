import React, { useState } from "react";
import { getContract } from "sdk/src/lib/utils";

import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getLimit } from "sdk/src/ReadFunctions/getLimit";
import "../../styles/main.css";

function GetLimit() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [limit, setLimit] = useState("");

  async function handleGetLimit() {
    setLimit("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getLimit(contract)
        .then((res) => {
          setLimit(res.toString());
        })
        .catch((error) => {
          setErroMessage(JSON.stringify(error));
        });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Get Limit</h2>
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
        <button onClick={handleGetLimit}>Get Limit</button>
      </div>
      <div className="row">
        <p>Limit: {limit}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>{" "}
      </div>
    </div>
  );
}

export default GetLimit;
