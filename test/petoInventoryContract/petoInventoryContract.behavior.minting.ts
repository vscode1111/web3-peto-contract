import { expect } from "chai";
import { invTestData } from "test/petoInventoryContract/testData";
import { initCollectionsReal as initCollections } from "test/utils";

export function shouldBehaveCorrectMinting(): void {
  describe("minting", () => {
    describe("setURI", () => {
      beforeEach(async function () {
        await this.ownerPetoInventoryContract.setURI(invTestData.uri);
        expect(await this.ownerPetoInventoryContract.contractURI()).eq(
          `${invTestData.uri}contract.json`,
        );
      });

      it("should procced the minting", async function () {
        await this.ownerPetoInventoryContract.safeMint(this.owner.address);
        let tokens = await this.ownerPetoInventoryContract.fetchTokens();
        expect(tokens.length).eq(1);
        expect(tokens[0].tokenId).eq(0);
        expect(tokens[0].owner).eq(this.owner.address);
        expect(await this.ownerPetoInventoryContract.tokenURI(0)).eq(`${invTestData.uri}0.json`);

        await this.ownerPetoInventoryContract.safeMint(this.owner.address);
        tokens = await this.ownerPetoInventoryContract.fetchTokens();
        expect(tokens.length).eq(2);
        expect(tokens[0].tokenId).eq(0);
        expect(tokens[0].owner).eq(this.owner.address);
        expect(await this.ownerPetoInventoryContract.tokenURI(0)).eq(`${invTestData.uri}0.json`);
        expect(tokens[1].tokenId).eq(1);
        expect(tokens[1].owner).eq(this.owner.address);
        expect(await this.ownerPetoInventoryContract.tokenURI(1)).eq(`${invTestData.uri}1.json`);
      });

      it("should procced the batch minting", async function () {
        await this.ownerPetoInventoryContract.safeMintBatch([
          this.owner.address,
          this.user1.address,
          this.user2.address,
          this.user3.address,
        ]);
        let tokens = await this.ownerPetoInventoryContract.fetchTokens();
        expect(tokens.length).eq(4);
        expect(tokens[0].tokenId).eq(0);
        expect(tokens[0].owner).eq(this.owner.address);

        for (const token of tokens) {
          const tokenId = token.tokenId;
          expect(await this.ownerPetoInventoryContract.tokenURI(tokenId)).eq(
            `${invTestData.uri}${tokenId}.json`,
          );
        }
      });
    });

    it("should call createTokens correctly", async function () {
      await initCollections(this.ownerPetoInventoryContract);

      expect(await this.ownerPetoInventoryContract.balanceOf(this.owner.address)).eq(
        invTestData.tokenCount,
      );
      expect(await this.ownerPetoInventoryContract.ownerOf(0)).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(1)).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(2)).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(3)).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.ownerOf(4)).eq(this.owner.address);

      const tokens = await this.ownerPetoInventoryContract.fetchTokens();
      expect(tokens.length).eq(invTestData.tokenCount);
      expect(tokens[0].tokenId).eq(0);
      expect(tokens[0].owner).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(0)).eq(`${invTestData.uri}0.json`);
      expect(tokens[1].tokenId).eq(1);
      expect(tokens[1].owner).eq(this.owner.address);
      expect(await this.ownerPetoInventoryContract.tokenURI(1)).eq(`${invTestData.uri}1.json`);
    });
  });
}
