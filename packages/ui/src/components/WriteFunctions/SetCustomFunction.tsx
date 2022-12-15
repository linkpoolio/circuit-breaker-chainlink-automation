import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { setCustomFunction } from "sdk/src/WriteFunctions/setCustomFunction";

function SetCustomFunction() {
  const [contractAddress, setContractAddress] = useState("");
  const [externalContract, setExternalContract] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");

  const [errorMessage, setErroMessage] = useState("");

  async function handleSetCustomFunction() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      setCustomFunction(contract, externalContract, functionSelector).catch(
        (error) => {
          setErroMessage(error.message);
        }
      );
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Set Custom Function</h2>
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
          value={externalContract}
          placeholder="externalContract (address)"
          onChange={(e) => setExternalContract(e.target.value)}
        />
      </div>
      <div className="row">
        <input
          type="string"
          value={functionSelector}
          placeholder="functionSelector (bytes)"
          onChange={(e) => setFunctionSelector(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleSetCustomFunction}>Set Custom Function</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default SetCustomFunction;
