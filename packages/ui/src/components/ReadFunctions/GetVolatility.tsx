import { useState } from "react";
import { getContract } from "sdk/src/lib/utils";
import CircuitBreaker from "sdk/src/abi/contracts/CircuitBreaker.sol/CircuitBreaker.json";
import { getVolatility } from "sdk/src/ReadFunctions/getVolatility";
import "../../styles/main.css";

function GetVolatility() {
  const [contractAddress, setContractAddress] = useState("");
  const [errorMessage, setErroMessage] = useState("");

  const [volatilityPercentage, setVolatilityPercentage] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  async function handleGetVolatility() {
    setVolatilityPercentage("");
    setCurrentPrice("");
    setErroMessage("");
    try {
      const contract = getContract(contractAddress, CircuitBreaker);
      getVolatility(contract)
        .then((res) => {
          setVolatilityPercentage(res.volatilityPercentage.toString());
          setCurrentPrice(res.currentPrice.toString());
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
        <h2>Get Volatility</h2>
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
        <button onClick={handleGetVolatility}>Get Volatility</button>
      </div>
      <div className="row">
        <p>Current Price: {currentPrice}</p>
      </div>
      <div className="row">
        <p>Volatility Percentage: {volatilityPercentage}</p>
      </div>
      <div className="row">
        <p>
          Error: <span className="error">{errorMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default GetVolatility;
