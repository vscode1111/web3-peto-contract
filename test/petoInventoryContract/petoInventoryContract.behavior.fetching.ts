import { expect } from "chai";
import { deployData } from "deploy/petoInventoryContract/deployData";
import { testData } from "test/petoInventoryContract/testData";
import { initCollectionsReal } from "test/utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct name and symbol", async function () {
      expect(await this.ownerPetoInventoryContract.name()).equal(deployData.name);
      expect(await this.ownerPetoInventoryContract.symbol()).equal(deployData.symbol);
    });

    it("should call fetchTokens correctly", async function () {
      await initCollectionsReal(this.ownerPetoInventoryContract);

      const tokens = await this.ownerPetoInventoryContract.fetchTokens();
      expect(tokens.length).equal(testData.tokenCount);
      expect(tokens[0].tokenId).equal(0);
      expect(tokens[0].owner).equal(this.owner.address);
    });

    it("should call fetchToken correctly", async function () {
      await initCollectionsReal(this.ownerPetoInventoryContract);

      const token = await this.ownerPetoInventoryContract.fetchToken(testData.tokenId);
      expect(token.tokenId).equal(testData.tokenId);
      expect(token.owner).equal(this.owner.address);
    });

    it("should call getTokenCount correctly", async function () {
      await initCollectionsReal(this.ownerPetoInventoryContract);
      expect(await this.ownerPetoInventoryContract.getTokenCount()).equal(testData.tokenCount);
    });
  });
}
