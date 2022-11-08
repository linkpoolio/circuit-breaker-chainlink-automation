import { ethers } from "hardhat";

async function main() {
  const feed = "0xA39434A63A52E749F02807ae27335515BA4b07F7";
  const limit = 0;
  const interval = 0;
  const price = 0;
  const events = [0, 1];
  const CB = await ethers.getContractFactory("CircuitBreaker");
  const cb = await CB.deploy(feed, limit, interval, price, events);

  await cb.deployed();

  console.log(`Circuit Breaker deployed to ${cb.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
