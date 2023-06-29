import { network } from "hardhat";
import { deploy } from "../test/utils/helpers";
import { networkConfig } from "../network.config";

async function main() {
  const chainId =
    network.config.chainId != undefined ? network.config.chainId : 31337;
  const networkName = {
    name: networkConfig[chainId].name,
    feed: networkConfig[chainId].feed,
    keepersRegistry: networkConfig[chainId].keepersRegistry,
  };
  const cb = await deploy("CircuitBreaker", [
    networkName.feed,
    networkName.keepersRegistry,
  ]);

  await cb.deployed();

  console.log(`Circuit Breaker deployed to ${cb.address}`);
}

main().catch((error: any) => {
  process.exitCode = 1;
});
