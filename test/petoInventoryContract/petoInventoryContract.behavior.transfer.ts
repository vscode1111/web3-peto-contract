import { INITIAL_POSITIVE_CHECK_TEST_TITLE, vmEsceptionText } from "@common";
import { invSeedData } from "@seeds";
import { PetoInventoryContextBase, initCollections, invTestData } from "@test";
import { expect } from "chai";

import { invErrorMessage } from "./testData";

const TRANSFER3P = "safeTransferFrom(address,address,uint256)";
const TRANSFER4P = "safeTransferFrom(address,address,uint256,bytes)";

async function validateStateAfterTransfer(that: PetoInventoryContextBase) {
  const token = await that.ownerPetoInventoryContract.fetchToken(invTestData.tokenId);
  expect(token.tokenId).eq(invTestData.tokenId);
  expect(token.owner).eq(that.user1.address);
  expect(token.transfered).eq(true);
  expect(await that.ownerPetoInventoryContract.balanceOf(that.owner.address)).eq(
    invTestData.tokenCount - 1,
  );
  expect(await that.ownerPetoInventoryContract.balanceOf(that.user1.address)).eq(1);
  expect(await that.ownerPetoInventoryContract.ownerOf(invTestData.tokenId)).eq(that.user1.address);
}

export function shouldBehaveCorrectTransfer(): void {
  describe("fetching", () => {
    describe("initCollectionsReal", () => {
      beforeEach(async function () {
        await initCollections(this.ownerPetoInventoryContract);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await this.ownerPetoInventoryContract.balanceOf(this.owner.address)).eq(
          invTestData.tokenCount,
        );

        const tokens = await this.ownerPetoInventoryContract.fetchTokens();
        for (const token of tokens) {
          expect(await this.ownerPetoInventoryContract.ownerOf(token.tokenId)).eq(
            this.owner.address,
          );
        }
      });

      it("should call transferFrom correctly", async function () {
        await this.ownerPetoInventoryContract.transferFrom(
          this.owner.address,
          this.user1.address,
          invTestData.tokenId,
        );
        await validateStateAfterTransfer(this);
      });

      it("should call safeTransferFrom(3 params) correctly", async function () {
        await this.ownerPetoInventoryContract[TRANSFER3P](
          this.owner.address,
          this.user1.address,
          invTestData.tokenId,
        );
        await validateStateAfterTransfer(this);
      });

      it("should call safeTransferFrom(4 params) correctly", async function () {
        await this.ownerPetoInventoryContract[TRANSFER4P](
          this.owner.address,
          this.user1.address,
          invTestData.tokenId,
          invSeedData.emptyData,
        );
        await validateStateAfterTransfer(this);
      });

      it("throw error when shop tries to transfer unapproved", async function () {
        await expect(
          this.shopPetoInventoryContract[TRANSFER3P](
            this.owner.address,
            this.user1.address,
            invTestData.tokenId,
          ),
        ).rejectedWith(vmEsceptionText(invErrorMessage.callerIsNotTokenOwnerOrApproved));
      });

      describe("updateToken", () => {
        beforeEach(async function () {
          await this.ownerPetoInventoryContract.updateToken(invTestData.tokenId, false);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          const token = await this.ownerPetoInventoryContract.fetchToken(invTestData.tokenId);
          expect(token.tokenId).eq(invTestData.tokenId);
          expect(token.owner).eq(this.owner.address);
          expect(token.transferable).eq(false);
        });

        it("throw error when owner tries to transfer untranferable token using safeTransferFrom(3 params)", async function () {
          await expect(
            this.ownerPetoInventoryContract[TRANSFER3P](
              this.owner.address,
              this.user1.address,
              invTestData.tokenId,
            ),
          ).rejectedWith(vmEsceptionText(invErrorMessage.tokenMustBeTransferable));
        });

        it("throw error when owner tries to transfer untranferable token using safeTransferFrom(4 params)", async function () {
          await expect(
            this.ownerPetoInventoryContract[TRANSFER4P](
              this.owner.address,
              this.user1.address,
              invTestData.tokenId,
              invSeedData.emptyData,
            ),
          ).rejectedWith(vmEsceptionText(invErrorMessage.tokenMustBeTransferable));
        });
      });

      describe("burn", () => {
        beforeEach(async function () {
          await this.ownerPetoInventoryContract.burn(invTestData.tokenId);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          const token = await this.ownerPetoInventoryContract.fetchToken(invTestData.tokenId);
          expect(token.tokenId).eq(invTestData.tokenId);
          expect(token.owner).eq(invTestData.nullAddress);
          expect(token.transferable).eq(false);
        });

        it("throw error when owner tries to transfer burnt token using safeTransferFrom(3 params)", async function () {
          await expect(
            this.ownerPetoInventoryContract[TRANSFER3P](
              this.owner.address,
              this.user1.address,
              invTestData.tokenId,
            ),
          ).rejectedWith(vmEsceptionText(invErrorMessage.thisTokenWasBurnt));
        });
      });

      describe("setApprovalForAll", () => {
        beforeEach(async function () {
          await this.ownerPetoInventoryContract.setApprovalForAll(this.shop.address, true);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(
            await this.ownerPetoInventoryContract.isApprovedForAll(
              this.owner.address,
              this.shop.address,
            ),
          ).eq(true);
        });

        it("should call safeTransferFrom(4 params) correctly by shop", async function () {
          await this.shopPetoInventoryContract[TRANSFER4P](
            this.owner.address,
            this.user1.address,
            invTestData.tokenId,
            invSeedData.emptyData,
          );

          expect(await this.ownerPetoInventoryContract.ownerOf(invTestData.tokenId)).eq(
            this.user1.address,
          );
        });
      });
    });
  });
}
