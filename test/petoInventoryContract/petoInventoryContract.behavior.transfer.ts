import { expect } from "chai";
import { testData } from "test/petoInventoryContract/testData";
import { initCollectionsReal } from "test/utils";

export function shouldBehaveCorrectTransfer(): void {
  describe("fetching", () => {
    it("should call safeTransferFrom(3 params) correctly", async function () {
      await initCollectionsReal(this.ownerPetoInventoryContract);

      await this.ownerPetoInventoryContract["safeTransferFrom(address,address,uint256)"](
        this.owner.address,
        this.user1.address,
        testData.tokenId,
      );

      const token = await this.ownerPetoInventoryContract.fetchToken(testData.tokenId);
      expect(token.tokenId).equal(testData.tokenId);
      expect(token.owner).equal(this.user1.address);
      expect(await this.ownerPetoInventoryContract.balanceOf(this.owner.address)).equal(
        testData.tokenCount - 1,
      );
      expect(await this.ownerPetoInventoryContract.balanceOf(this.user1.address)).equal(1);
      expect(await this.ownerPetoInventoryContract.ownerOf(testData.tokenId)).equal(
        this.user1.address,
      );
    });

    it("should call safeTransferFrom(4 params) correctly", async function () {
      await initCollectionsReal(this.ownerPetoInventoryContract);

      await this.ownerPetoInventoryContract["safeTransferFrom(address,address,uint256,bytes)"](
        this.owner.address,
        this.user1.address,
        testData.tokenId,
        [],
      );

      const token = await this.ownerPetoInventoryContract.fetchToken(testData.tokenId);
      expect(token.tokenId).equal(testData.tokenId);
      expect(token.owner).equal(this.user1.address);
      expect(await this.ownerPetoInventoryContract.balanceOf(this.owner.address)).equal(
        testData.tokenCount - 1,
      );
      expect(await this.ownerPetoInventoryContract.balanceOf(this.user1.address)).equal(1);
      expect(await this.ownerPetoInventoryContract.ownerOf(testData.tokenId)).equal(
        this.user1.address,
      );
    });
  });
}
