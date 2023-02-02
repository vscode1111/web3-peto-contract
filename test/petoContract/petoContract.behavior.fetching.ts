import { expect } from "chai";
import { testValue } from "test/testData";
import { initCollectionsReal } from "test/utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct name and symbol", async function () {
      expect(await this.adminPetoContract.name()).to.equal(testValue.name);
      expect(await this.adminPetoContract.symbol()).to.equal(testValue.symbol);
    });
    it("should call fetchTokens correctly", async function () {
      await initCollectionsReal(this.adminPetoContract);

      const tokens = await this.adminPetoContract.fetchTokens();
      expect(tokens.length).to.equal(testValue.tokenCount);
      expect(tokens[0].tokenId).to.equal(0);
      expect(tokens[0].owner).to.equal(this.admin.address);
    });
    it("should call fetchToken correctly", async function () {
      await initCollectionsReal(this.adminPetoContract);

      const token = await this.adminPetoContract.fetchToken(testValue.tokenId);
      expect(token.tokenId).to.equal(testValue.tokenId);
      expect(token.owner).to.equal(this.admin.address);
    });
    it.only("should call getTokenCount correctly", async function () {
      await initCollectionsReal(this.adminPetoContract);
      // console.log(111, testValue.tokenCount);
      expect(await this.adminPetoContract.getTokenCount()).to.equal(testValue.tokenCount);
    });
  });
}
