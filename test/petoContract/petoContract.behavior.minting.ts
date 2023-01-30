import { expect } from "chai";
import { testValue } from "test/testData";

export function shouldBehaveCorrectMinting(): void {
  describe("minting", () => {
    it("should procced the minting", async function () {
      await this.adminPetoContract.setURI(testValue.uri);

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

    it("should to call createTokens correctly", async function () {
      await this.adminPetoContract.setURI(testValue.uri);

      await this.adminPetoContract.createTokens(testValue.tokenCount);
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
