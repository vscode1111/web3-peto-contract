import { betSeedData } from "@seeds";
import { expect } from "chai";

import { checkTotalBalance } from "./utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct owner address", async function () {
      expect(await this.ownerPetoBetContract.owner()).eq(this.owner.address);
    });

    it("should return correct contract's balance", async function () {
      expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.zero);
    });

    it("should return correct user's balances and total balance", async function () {
      expect(await this.owner.getBalance()).closeTo(
        betSeedData.accountInitBalance,
        betSeedData.error,
      );
      expect(await this.user1.getBalance()).eq(betSeedData.accountInitBalance);
      expect(await this.user2.getBalance()).eq(betSeedData.accountInitBalance);
      await checkTotalBalance(this);
    });

    it("should return correct fee balance", async function () {
      expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
    });

    it("should return correct hash of gameId", async function () {
      expect(await this.ownerPetoBetContract.getGameIdHash(betSeedData.gameId0)).eq(
        betSeedData.gameIdHash0,
      );
      expect(await this.ownerPetoBetContract.getGameIdHash(betSeedData.gameId1)).eq(
        betSeedData.gameIdHash1,
      );
    });
  });
}
