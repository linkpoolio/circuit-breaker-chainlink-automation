import { ethers } from "hardhat";

async function main() {
  const feed = "0xA39434A63A52E749F02807ae27335515BA4b07F7";
  const keeperRegistryAddress = "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b";
  const events = [0];
  const CB = await ethers.getContractFactory("CircuitBreaker");
  const cb = await CB.deploy(feed, events, keeperRegistryAddress);

  await cb.deployed();

  console.log(`Circuit Breaker deployed to ${cb.address}`);
}

main().catch((error: any) => {
  process.exitCode = 1;
});
