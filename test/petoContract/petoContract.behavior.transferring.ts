import { expect } from "chai";
import { testValue } from "test/testData";
import { initCollectionsReal } from "test/utils";

export function shouldBehaveCorrectTransferring(): void {
  describe("fetching", () => {
    it("should call safeTransferFrom(3 params) correctly", async function () {
      await initCollectionsReal(this.adminPetoContract);

      await this.adminPetoContract["safeTransferFrom(address,address,uint256)"](
        this.admin.address,
        this.user1.address,
        testValue.tokenId,
      );

      const token = await this.adminPetoContract.fetchToken(testValue.tokenId);
      expect(token.tokenId).to.equal(testValue.tokenId);
      expect(token.owner).to.equal(this.user1.address);
      expect(await this.adminPetoContract.balanceOf(this.admin.address)).to.equal(
        testValue.tokenCount - 1,
      );
      expect(await this.adminPetoContract.balanceOf(this.user1.address)).to.equal(1);
      expect(await this.adminPetoContract.ownerOf(testValue.tokenId)).to.equal(this.user1.address);
    });

    it("should call safeTransferFrom(4 params) correctly", async function () {
      await initCollectionsReal(this.adminPetoContract);

      await this.adminPetoContract["safeTransferFrom(address,address,uint256,bytes)"](
        this.admin.address,
        this.user1.address,
        testValue.tokenId,
        [],
      );

      const token = await this.adminPetoContract.fetchToken(testValue.tokenId);
      expect(token.tokenId).to.equal(testValue.tokenId);
      expect(token.owner).to.equal(this.user1.address);
      expect(await this.adminPetoContract.balanceOf(this.admin.address)).to.equal(
        testValue.tokenCount - 1,
      );
      expect(await this.adminPetoContract.balanceOf(this.user1.address)).to.equal(1);
      expect(await this.adminPetoContract.ownerOf(testValue.tokenId)).to.equal(this.user1.address);
    });
  });
}
