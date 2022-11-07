import { ethers } from "hardhat";

async function main() {
  const feed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const limit = 0;
  const interval = 0;
  const price = 0;
  const CB = await ethers.getContractFactory("CircuitBreaker");
  const cb = await CB.deploy(feed, limit, interval, price);

  await cb.deployed();

  console.log(`Circuit Breaker deployed to ${cb.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
