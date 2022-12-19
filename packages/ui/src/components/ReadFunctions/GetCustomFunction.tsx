import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getCustomFunction } from "sdk/src/ReadFunctions/getCustomFunction";
import "../../styles/main.css";

function GetCustomFunction() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [externalContract, setExternalContract] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");

  async function handleGetVolatility() {
    setExternalContract("");
    setFunctionSelector("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getCustomFunction(contract)
        .then((res) => {
          setExternalContract(res.externalContract.toString());
          setFunctionSelector(res.functionSelector.toString());
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
        <h2>Get Custom Function</h2>
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
        <button onClick={handleGetVolatility}>Get Custom Function</button>
      </div>
      <div className="row">
        <p>External Contract: {externalContract}</p>
      </div>
      <div className="row">
        <p>Funciton Selector: {functionSelector}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default GetCustomFunction;
