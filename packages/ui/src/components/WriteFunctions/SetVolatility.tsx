import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { setVolatility } from "sdk/src/WriteFunctions/setVolatility";

function SetVolatility() {
  const [contractAddress, setContractAddress] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [percentage, setPercentage] = useState("");

  const [errorMessage, setErroMessage] = useState("");

  async function handleSetVolatility() {
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      setVolatility(contract, Number(currentPrice), Number(percentage)).catch(
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
        <h2>Set Volatility</h2>
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
          value={currentPrice}
          placeholder="currentPrice (int256)"
          onChange={(e) => setCurrentPrice(e.target.value)}
        />
      </div>
      <div className="row">
        <input
          type="number"
          value={percentage}
          placeholder="percentage (int8)"
          onChange={(e) => setPercentage(e.target.value)}
        />
      </div>
      <div className="row">
        <button onClick={handleSetVolatility}>Set Volatility</button>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default SetVolatility;
