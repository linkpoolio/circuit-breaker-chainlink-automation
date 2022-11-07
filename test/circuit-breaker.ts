import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Circuit Breaker", function () {
  async function deployCircuitBreakerFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const feed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
    const limit = 0;
    const interval = 0;
    const price = 0;

    const CB = await ethers.getContractFactory("CircuitBreaker");
    const cb = await CB.deploy(feed, limit, interval, price);

    return { cb, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set variables", async function () {
      const { cb } = await loadFixture(deployCircuitBreakerFixture);

      expect(await cb.interval()).to.equal(0);
    });
  });
});
