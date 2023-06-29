enum EventType {
  Limit,
  Staleness,
  Volatility,
}

export const networkConfig: { [key: number]: any } = {
  31337: {
    name: "hardhat",
    feed: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    keepersRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  },
  1: {
    name: "mainnet",
    feed: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", // set feed address
    keepersRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  },
  5: {
    name: "goerli",
    feed: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", // set feed address
    keepersRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  },
  56: {
    name: "binance",
    feed: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", // set feed address
    keepersRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  },
  137: {
    name: "polygon",
    feed: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", // set feed address
    keepersRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
  },
};
