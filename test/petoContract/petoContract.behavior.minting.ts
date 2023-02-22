import { expect } from "chai";
import { testValue } from "test/testData";
import { initCollectionsReal as initCollections } from "test/utils";

export function shouldBehaveCorrectMinting(): void {
  describe("minting", () => {
    it.only("should procced the minting", async function () {
      await this.adminPetoContract.setURI(testValue.uri);
      expect(await this.adminPetoContract.contractURI()).to.equal(`${testValue.uri}contract.json`);

      await this.adminPetoContract.safeMint(this.admin.address);
      let tokens = await this.adminPetoContract.fetchTokens();
      expect(tokens.length).to.equal(1);
      expect(tokens[0].tokenId).to.equal(0);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(await this.adminPetoContract.tokenURI(0)).to.equal(`${testValue.uri}0.json`);

      await this.adminPetoContract.safeMint(this.admin.address);
      tokens = await this.adminPetoContract.fetchTokens();
      expect(tokens.length).to.equal(2);
      expect(tokens[0].tokenId).to.equal(0);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(await this.adminPetoContract.tokenURI(0)).to.equal(`${testValue.uri}0.json`);
      expect(tokens[1].tokenId).to.equal(1);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(await this.adminPetoContract.tokenURI(1)).to.equal(`${testValue.uri}1.json`);
    });

    it("should call createTokens correctly", async function () {
      await initCollections(this.adminPetoContract);

      expect(await this.adminPetoContract.balanceOf(this.admin.address)).to.equal(
        testValue.tokenCount,
      );
      expect(await this.adminPetoContract.ownerOf(0)).to.equal(this.admin.address);
      expect(await this.adminPetoContract.ownerOf(1)).to.equal(this.admin.address);
      expect(await this.adminPetoContract.ownerOf(2)).to.equal(this.admin.address);
      expect(await this.adminPetoContract.ownerOf(3)).to.equal(this.admin.address);
      expect(await this.adminPetoContract.ownerOf(4)).to.equal(this.admin.address);

      const tokens = await this.adminPetoContract.fetchTokens();
      expect(tokens.length).to.equal(testValue.tokenCount);
      expect(tokens[0].tokenId).to.equal(0);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(await this.adminPetoContract.tokenURI(0)).to.equal(`${testValue.uri}0.json`);
      expect(tokens[1].tokenId).to.equal(1);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(await this.adminPetoContract.tokenURI(1)).to.equal(`${testValue.uri}1.json`);
    });
  });
}
