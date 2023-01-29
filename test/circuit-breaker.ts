import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers, network } from "hardhat";
import { deploy } from "./utils/helpers";

enum EventType {
  Limit,
  Staleness,
  Volatility,
  None,
}

describe("Circuit Breaker", function () {
  let owner: any,
    feed: any,
    limit: any,
    interval: any,
    price: any,
    events: any,
    customMock: any;
  let circuitBreaker: any;
  let keeperRegistryAddress: any;
  let autoID: any;
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    feed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet ETH/USD feed
    limit = 0;
    interval = 0;
    price = 0;
    events = [];
    customMock = await deploy("CustomMock");
    circuitBreaker = await deploy("CircuitBreaker", [
      feed,
      events,
      owner.address,
    ]);
    keeperRegistryAddress = "0x02777053d6764996e594c3E88AF1D58D5363a2e6"; // Mainnet Registry
    autoID =
      "79397418041944963404933264302166499203692745230067317398393317479845798937310";
  });

  describe("constructor", function () {
    it("sets interval", async () => {
      assert.equal(await circuitBreaker.interval(), 0);
    });
    it("sets feed", async () => {
      assert.equal(
        await circuitBreaker.priceFeed(),
        "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      );
    });
  });

  describe("User Actions", function () {
    it("should retrieve events", async function () {
      const e = await circuitBreaker.getEvents();
      expect(e.length).to.equal(0);
    });
    it("should add event type", async function () {
      await circuitBreaker.addEventTypes([2]);
      const e = await circuitBreaker.getEvents();
      expect(e[0]).to.equal(EventType.Volatility);
    });
    it("should delete event", async function () {
      await circuitBreaker.addEventTypes([2]);
      let e = await circuitBreaker.getEvents();
      expect(e.length).to.equal(1);
      await circuitBreaker.deleteEventTypes([2]);
      e = await circuitBreaker.getEvents();
      expect(e.length).to.equal(0);
    });
    it("should delete multiple events", async function () {
      await circuitBreaker.addEventTypes([1, 2]);
      let v = await circuitBreaker.getEvents();
      expect(v.length).to.equal(2);
      await circuitBreaker.deleteEventTypes([1, 2]);
      const e = await circuitBreaker.getEvents();
      expect(e.length).to.equal(0);
    });
    it("Should not add event type if already exists", async function () {
      await circuitBreaker.addEventTypes([2]);
      expect(circuitBreaker.addEventTypes([2])).to.be.revertedWith(
        "Event type already configured"
      );
    });
  });

  describe("checkUpkeep", function () {
    it("returns false if no events are set", async () => {
      await network.provider.send("evm_increaseTime", [interval + 1]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const { upkeepNeeded } = await circuitBreaker.callStatic.checkUpkeep(
        "0x"
      );
      assert(!upkeepNeeded);
    });
  });
  describe("performUpkeep", function () {
    it("can only run if checkupkeep is true", async () => {
      await network.provider.send("evm_increaseTime", [interval + 1]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const tx = await circuitBreaker.performUpkeep("0x");
      assert(tx);
    });
    it("emits correct event on performUpkeep", async () => {
      await circuitBreaker.addEventTypes([0]);
      await circuitBreaker.setLimit(0, 100);
      await expect(circuitBreaker.performUpkeep("0x")).to.emit(
        circuitBreaker,
        "LimitReached"
      );
    });
    it("not emit when not needed", async () => {
      await circuitBreaker.addEventTypes([0]);
      await circuitBreaker.setLimit(0, "1000000000000000000000"); // high limit set above price
      await expect(circuitBreaker.performUpkeep("0x")).to.not.emit(
        circuitBreaker,
        "LimitReached"
      );
    });
  });

  describe("calculateChange", function () {
    it("should run calculateChange on volatility and perform upkeep because of deviation", async () => {
      await circuitBreaker.addEventTypes([2]); // Volatility

      const price = "1587523800000";
      const percentage = "100000000000000000"; // 10%
      await circuitBreaker.setVolatility(price, percentage);
      await expect(circuitBreaker.performUpkeep("0x")).to.emit(
        circuitBreaker,
        "VolatilityReached"
      );
    });
    it("should revert when setting 0 limits", async () => {
      await expect(circuitBreaker.setLimit(0, 0)).to.be.revertedWith(
        "Must set at least one limit"
      );
    });
    it("should emit limit updated event", async () => {
      await expect(circuitBreaker.setLimit(0, 100)).to.emit(
        circuitBreaker,
        "LimitUpdated"
      );
    });
  });
  describe("custom function", function () {
    it("should set custom function", async () => {
      await circuitBreaker.setCustomFunction(
        customMock.address,
        "0x29e99f070000000000000000000000000000000000000000000000000000000000000045"
      );
      assert(
        (await circuitBreaker.functionSelector()) ===
          "0x29e99f070000000000000000000000000000000000000000000000000000000000000045"
      );
    });
    it("should call custom function", async () => {
      await circuitBreaker.setCustomFunction(
        customMock.address,
        "0x29e99f070000000000000000000000000000000000000000000000000000000000000309"
      );
      await circuitBreaker.customFunction();
      const number = await customMock.num();
      assert(number == 777);
    });
    it("should pause custom function", async () => {
      await circuitBreaker.setCustomFunction(
        customMock.address,
        "0x29e99f070000000000000000000000000000000000000000000000000000000000000045"
      );
      await circuitBreaker.pauseCustomFunction();
      assert((await circuitBreaker.usingExternalContract()) === false);
    });
    it("should run function in upkeep", async () => {
      await circuitBreaker.setCustomFunction(
        customMock.address,
        "0x29e99f070000000000000000000000000000000000000000000000000000000000000309"
      );
      await circuitBreaker.addEventTypes([0]);
      await circuitBreaker.setLimit(0, 100);
      await expect(circuitBreaker.performUpkeep("0x")).to.emit(
        circuitBreaker,
        "LimitReached"
      );
      const number = await customMock.num();
      assert(number == 777);
    });
  });
});
