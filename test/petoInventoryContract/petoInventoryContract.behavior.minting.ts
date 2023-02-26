import { expect } from "chai";
import { testData } from "test/petoInventoryContract/testData";
import { initCollectionsReal as initCollections } from "test/utils";

export function shouldBehaveCorrectMinting(): void {
  describe("minting", () => {
    it("should procced the minting", async function () {
      await this.ownerPetoInventoryContract.setURI(testData.uri);
      expect(await this.ownerPetoInventoryContract.contractURI()).equal(
        `${testData.uri}contract.json`,
      );

      await this.ownerPetoInventoryContract.safeMint(this.owner.address);
      let tokens = await this.ownerPetoInventoryContract.fetchTokens();
      expect(tokens.length).equal(1);
      expect(tokens[0].tokenId).equal(0);
      expect(tokens[0].owner).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(0)).equal(`${testData.uri}0.json`);

      await this.ownerPetoInventoryContract.safeMint(this.owner.address);
      tokens = await this.ownerPetoInventoryContract.fetchTokens();
      expect(tokens.length).equal(2);
      expect(tokens[0].tokenId).equal(0);
      expect(tokens[0].owner).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(0)).equal(`${testData.uri}0.json`);
      expect(tokens[1].tokenId).equal(1);
      expect(tokens[1].owner).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(1)).equal(`${testData.uri}1.json`);
    });

    it("should call createTokens correctly", async function () {
      await initCollections(this.ownerPetoInventoryContract);

      expect(await this.ownerPetoInventoryContract.balanceOf(this.owner.address)).equal(
        testData.tokenCount,
      );
      expect(await this.ownerPetoInventoryContract.ownerOf(0)).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(1)).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(2)).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(3)).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(4)).equal(this.owner.address);

      const tokens = await this.ownerPetoInventoryContract.fetchTokens();
      expect(tokens.length).equal(testData.tokenCount);
      expect(tokens[0].tokenId).equal(0);
      expect(tokens[0].owner).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(0)).equal(`${testData.uri}0.json`);
      expect(tokens[1].tokenId).equal(1);
      expect(tokens[1].owner).equal(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(1)).equal(`${testData.uri}1.json`);
    });
  });
}
