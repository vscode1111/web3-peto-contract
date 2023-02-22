import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import { shouldBehaveCorrectFetching } from "./petoContract.behavior.fetching";
import { shouldBehaveCorrectMinting } from "./petoContract.behavior.minting";
import { shouldBehaveCorrectTransfer } from "./petoContract.behavior.transfer";
import { deployPetoContractFixture } from "./petoContract.fixture";

describe("PetoContract", function () {
  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.admin = signers[0];
    this.user1 = signers[1];
    this.user2 = signers[2];
    this.shop = signers[3];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { adminPetoContract, user1PetoContract, user2PetoContract, shopPetoContract } =
      await this.loadFixture(deployPetoContractFixture);
    this.adminPetoContract = adminPetoContract;
    this.user1PetoContract = user1PetoContract;
    this.user2PetoContract = user2PetoContract;
    this.shopPetoContract = shopPetoContract;
  });

  shouldBehaveCorrectFetching();
  shouldBehaveCorrectMinting();
  shouldBehaveCorrectTransfer();
});
