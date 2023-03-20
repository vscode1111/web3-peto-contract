import { expect } from "chai";
import { seedData } from "seeds";

import { checkTotalBalance } from "./utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct owner address", async function () {
      expect(await this.ownerPetoBetContract.owner()).equal(this.owner.address);
    });

    it("should return correct contract's balance", async function () {
      expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.zero);
    });

    it("should return correct user's balances and total balance", async function () {
      expect(await this.owner.getBalance()).closeTo(seedData.accountInitBalance, seedData.error);
      expect(await this.user1.getBalance()).equal(seedData.accountInitBalance);
      expect(await this.user2.getBalance()).equal(seedData.accountInitBalance);
      await checkTotalBalance(this);
    });

    it("should return correct fee balance", async function () {
      expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
    });

    it("should return correct hash of gameId", async function () {
      expect(await this.ownerPetoBetContract.getGameIdHash(seedData.gameId0)).equal(
        seedData.gameIdHash0,
      );
      expect(await this.ownerPetoBetContract.getGameIdHash(seedData.gameId1)).equal(
        seedData.gameIdHash1,
      );
    });
  });
}
