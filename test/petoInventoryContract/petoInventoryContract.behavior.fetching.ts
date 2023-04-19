import { expect } from "chai";
import { deployData } from "deploy/petoInventoryContract/deployData";
import { invTestData } from "test/petoInventoryContract/testData";
import { initCollectionsReal } from "test/utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct name and symbol", async function () {
      expect(await this.ownerPetoInventoryContract.name()).eq(deployData.name);
      expect(await this.ownerPetoInventoryContract.symbol()).eq(deployData.symbol);
    });

    describe("initCollectionsReal", () => {
      beforeEach(async function () {
        await initCollectionsReal(this.ownerPetoInventoryContract);
      });

      it("should call fetchTokens correctly", async function () {
        const tokens = await this.ownerPetoInventoryContract.fetchTokens();
        expect(tokens.length).eq(invTestData.tokenCount);
        expect(tokens[0].tokenId).eq(0);
        expect(tokens[0].owner).eq(this.owner.address);
      });

      it("should call fetchToken correctly", async function () {
        const token = await this.ownerPetoInventoryContract.fetchToken(invTestData.tokenId);
        expect(token.tokenId).eq(invTestData.tokenId);
        expect(token.owner).eq(this.owner.address);
      });

      it("should call getTokenCount correctly", async function () {
        expect(await this.ownerPetoInventoryContract.getTokenCount()).eq(invTestData.tokenCount);
      });
    });
  });
}
