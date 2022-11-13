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
  let owner: any, feed: any, limit: any, interval: any, price: any, events: any;
  let vrfCoordinatorV2Mock: any;
  let circuitBreaker: any;
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    feed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet ETH/USD feed
    limit = 0;
    interval = 0;
    price = 0;
    events = [0];
    // vrfCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock");
    circuitBreaker = await deploy("CircuitBreaker", [
      feed,
      limit,
      interval,
      price,
      events,
    ]);
  });

  it("Should retrieve events", async function () {
    const e = await circuitBreaker.getEvents();
    expect(e[0]).to.equal(EventType.Limit);
  });

  it("Should add event type", async function () {
    await circuitBreaker.addEventType(2);
    const e = await circuitBreaker.getEvents();
    expect(e[1]).to.equal(EventType.Volatility);
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

  describe("checkUpkeep", function () {
    it("returns false if no events are set", async () => {
      console.log((await circuitBreaker.getEvents()).length);
      await network.provider.send("evm_increaseTime", [interval + 1]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const { upkeepNeeded } = await circuitBreaker.callStatic.checkUpkeep(
        "0x"
      );
      console.log(upkeepNeeded);
      assert(!upkeepNeeded);
    });
  });
  describe("performUpkeep", function () {
    it("can only run if checkupkeep is true", async () => {
      // await raffle.enterRaffle({ value: raffleEntranceFee });
      await network.provider.send("evm_increaseTime", [interval + 1]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const tx = await circuitBreaker.performUpkeep("0x");
      assert(tx);
    });
    // it("reverts if checkup is false", async () => {
    //   await expect(circuitBreaker.performUpkeep("0x")).to.be.revertedWith(
    //     "Raffle__UpkeepNotNeeded"
    //   );
    // });
    // it("updates the raffle state and emits a requestId", async () => {
    //   // Too many asserts in this test!
    //   // await circuitBreaker.enterRaffle({ value: raffleEntranceFee });
    //   await network.provider.send("evm_increaseTime", [interval + 1]);
    //   await network.provider.request({ method: "evm_mine", params: [] });
    //   const txResponse = await circuitBreaker.performUpkeep("0x"); // emits requestId
    //   const txReceipt = await txResponse.wait(1); // waits 1 block
    //   const raffleState = await circuitBreaker.getRaffleState(); // updates state
    //   const requestId = txReceipt.events[1].args.requestId;
    //   assert(requestId.toNumber() > 0);
    //   assert(raffleState == 1); // 0 = open, 1 = calculating
    // });
  });
});
