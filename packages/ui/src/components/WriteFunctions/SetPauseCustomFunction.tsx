import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { unpauseCustomFunction } from "sdk/src/WriteFunctions/unpauseCustomFunction";
import { pauseCustomFunction } from "sdk/src/WriteFunctions/pauseCustomFunction";

function SetPauseCustomFunction() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  async function handlePause() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      pauseCustomFunction(contract).catch((error) => {
        setErroMessage(error.message);
      });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  async function handleUnpause() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      unpauseCustomFunction(contract).catch((error) => {
        setErroMessage(error.message);
      });
    } catch (error) {
      setErroMessage(error.message);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h2>Set Pause Custom Function</h2>
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
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleUnpause}>Unpause</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default SetPauseCustomFunction;
