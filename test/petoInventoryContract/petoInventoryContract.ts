import { PETO_INVENTORY_CONTRACT_NAME } from "@constants/addresses";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { shouldBehaveCorrectFetching } from "./petoInventoryContract.behavior.fetching";
import { shouldBehaveCorrectMinting } from "./petoInventoryContract.behavior.minting";
import { shouldBehaveCorrectTransfer } from "./petoInventoryContract.behavior.transfer";
import { deployPetoContractFixture } from "./petoInventoryContract.fixture";

describe(PETO_INVENTORY_CONTRACT_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const {
      owner,
      user1,
      user2,
      user3,
      shop,
      ownerPetoInventoryContract,
      user1PetoInventoryContract,
      user2PetoInventoryContract,
      shopPetoInventoryContract,
    } = await this.loadFixture(deployPetoContractFixture);
    this.owner = owner;
    this.user1 = user1;
    this.user2 = user2;
    this.user3 = user3;
    this.shop = shop;
    this.ownerPetoInventoryContract = ownerPetoInventoryContract;
    this.user1PetoInventoryContract = user1PetoInventoryContract;
    this.user2PetoInventoryContract = user2PetoInventoryContract;
    this.shopPetoInventoryContract = shopPetoInventoryContract;
  });

  shouldBehaveCorrectFetching();
  shouldBehaveCorrectMinting();
  shouldBehaveCorrectTransfer();
});
