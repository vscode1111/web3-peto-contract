import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";

import { shouldBehaveCorrectFetching } from "./petoBetContract.behavior.fetching";
import { shouldBehaveCorrectFunding } from "./petoBetContract.behavior.funding";
import { deployPetoContractFixture } from "./petoBetContract.fixture";

describe(PETO_BET_CONTRACT_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const {
      owner,
      user1,
      user2,
      ownerPetoBetContract,
      user1PetoBetContract,
      user2PetoBetContract,
    } = await this.loadFixture(deployPetoContractFixture);
    this.owner = owner;
    this.user1 = user1;
    this.user2 = user2;
    this.ownerPetoBetContract = ownerPetoBetContract;
    this.user1PetoBetContract = user1PetoBetContract;
    this.user2PetoBetContract = user2PetoBetContract;
  });

  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFunding();
});
