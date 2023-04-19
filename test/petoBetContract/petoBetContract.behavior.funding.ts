import { expect } from "chai";
import {
  INITIAL_POSITIVE_CHECK_TEST_TITLE,
  commonErrorMessage,
  getNow,
  vmEsceptionText,
  waitTx,
} from "common";
import { betSeedData } from "seeds";
import {
  DepositEvent,
  PairLockEvent,
  TransferEvent,
  WithdrawEvent,
  WithdrawFeeEvent,
} from "typechain-types/contracts/PetoBetContract";
import { signMessageForTransferEx } from "utils";

import { betErrorMessage } from "./testData";
import { EvenName } from "./types";
import { checkTotalBalance, checkTransfer } from "./utils";

export function shouldBehaveCorrectFunding(): void {
  describe("funding", () => {
    describe("first check", () => {
      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        const receipt = await waitTx(
          this.user1PetoBetContract.deposit({ value: betSeedData.deposit1 }),
        );

        const event = receipt.events?.find(
          (item) => item.event === EvenName.Deposit,
        ) as DepositEvent;
        expect(event).not.undefined;
        const { account, amount, timestamp } = event?.args;
        expect(account).eq(this.user1.address);
        expect(amount).eq(betSeedData.deposit1);
        expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);
      });

      describe("user1 deposited funds", () => {
        beforeEach(async function () {
          await this.user1PetoBetContract.deposit({ value: betSeedData.deposit1 });
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.user1.getBalance()).closeTo(
            betSeedData.accountInitBalance.sub(betSeedData.deposit1),
            betSeedData.error,
          );
          expect(await this.user2.getBalance()).closeTo(
            betSeedData.accountInitBalance,
            betSeedData.error,
          );

          const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
          expect(user1Balance.free).eq(betSeedData.deposit1);
          expect(user1Balance.locked).eq(betSeedData.zero);

          const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
          expect(user2Balance.free).eq(betSeedData.zero);
          expect(user2Balance.locked).eq(betSeedData.zero);

          expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
          expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit1);
          await checkTotalBalance(this);
        });

        it("user1 is allowed to withdraw", async function () {
          const receipt = await waitTx(this.user1PetoBetContract.withdraw(betSeedData.deposit1));

          const event = receipt.events?.find(
            (item) => item.event === EvenName.Withdraw,
          ) as WithdrawEvent;
          expect(event).not.undefined;
          const { account, amount, timestamp } = event?.args;
          expect(account).eq(this.user1.address);
          expect(amount).eq(betSeedData.deposit1);
          expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);

          expect(await this.user1.getBalance()).closeTo(
            betSeedData.accountInitBalance,
            betSeedData.error,
          );
          expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.zero);
        });

        it("should throw error when user2 tries to withdraw insufficent funds", async function () {
          await expect(this.user2PetoBetContract.withdraw(betSeedData.deposit1)).rejectedWith(
            vmEsceptionText(betErrorMessage.insufficentFunds),
          );
        });

        describe("user2 deposited funds", () => {
          beforeEach(async function () {
            await this.user2PetoBetContract.deposit({ value: betSeedData.deposit2 });
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.user1.getBalance()).closeTo(
              betSeedData.accountInitBalance.sub(betSeedData.deposit1),
              betSeedData.error,
            );
            expect(await this.user2.getBalance()).closeTo(
              betSeedData.accountInitBalance.sub(betSeedData.deposit2),
              betSeedData.error,
            );

            const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
            expect(user1Balance.free).eq(betSeedData.deposit1);
            expect(user1Balance.locked).eq(betSeedData.zero);

            const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
            expect(user2Balance.free).eq(betSeedData.deposit2);
            expect(user2Balance.locked).eq(betSeedData.zero);

            expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
            expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
            await checkTotalBalance(this);
          });

          it("user1 is allowed to withdraw", async function () {
            await this.user1PetoBetContract.withdraw(betSeedData.deposit1);

            const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
            expect(user1Balance.free).eq(betSeedData.zero);
            expect(user1Balance.locked).eq(betSeedData.zero);

            expect(await this.user1.getBalance()).closeTo(
              betSeedData.accountInitBalance,
              betSeedData.error,
            );

            expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit2);
          });

          it("should throw error when user1 tries to withdraw insufficent funds", async function () {
            await expect(this.user1PetoBetContract.withdraw(betSeedData.deposit12)).rejectedWith(
              vmEsceptionText(betErrorMessage.insufficentFunds),
            );
          });

          it("should throw error when user2 tries to withdraw insufficent funds", async function () {
            await expect(this.user2PetoBetContract.withdraw(betSeedData.deposit12)).rejectedWith(
              vmEsceptionText(betErrorMessage.insufficentFunds),
            );
          });

          it("check event when call pairLock", async function () {
            const receipt = await waitTx(
              this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.lock,
              ),
            );

            const event = receipt.events?.find(
              (item) => item.event === EvenName.PairLock,
            ) as PairLockEvent;
            expect(event).not.undefined;
            const { account1, account2, gameIdHash, amount, timestamp } = event?.args;
            expect(account1).eq(this.user1.address);
            expect(account2).eq(this.user2.address);
            expect(gameIdHash).eq(betSeedData.gameIdHash0);
            expect(amount).eq(betSeedData.lock);
            expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);
          });

          it("should throw error when owner tries to call pairLock twice", async function () {
            await this.ownerPetoBetContract.pairLock(
              this.user1.address,
              this.user2.address,
              betSeedData.gameId0,
              betSeedData.lock,
            );

            await expect(
              this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.lock,
              ),
            ).rejectedWith(vmEsceptionText(betErrorMessage.thisGameIdWasUsedBefore));
          });

          it("should throw error when user1 tries to call pairLock without permission", async function () {
            await expect(
              this.user1PetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.lock,
              ),
            ).rejectedWith(vmEsceptionText(commonErrorMessage.onlyOwner));
          });

          it("should throw error when user1 tries to call pairUnlock without permissio", async function () {
            await expect(this.user1PetoBetContract.pairUnlock(betSeedData.gameId0)).rejectedWith(
              vmEsceptionText(commonErrorMessage.onlyOwner),
            );
          });

          it("should throw error when user1 tries to call pairUnlock with non-exist gameId", async function () {
            await expect(this.ownerPetoBetContract.pairUnlock(betSeedData.gameId0)).rejectedWith(
              vmEsceptionText(betErrorMessage.thisGameDoesNotExist),
            );
          });

          describe("owner locked funds of user1 and user2", () => {
            beforeEach(async function () {
              await this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.lock,
              );
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              expect(await this.user1.getBalance()).closeTo(
                betSeedData.accountInitBalance.sub(betSeedData.deposit1),
                betSeedData.error,
              );
              expect(await this.user2.getBalance()).closeTo(
                betSeedData.accountInitBalance.sub(betSeedData.deposit2),
                betSeedData.error,
              );

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).eq(betSeedData.remains1);
              expect(user1Balance.locked).eq(betSeedData.lock);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).eq(betSeedData.remains2);
              expect(user2Balance.locked).eq(betSeedData.lock);

              expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
              expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
              await checkTotalBalance(this);
            });

            it("user1 is allowed to withdraw", async function () {
              await this.user1PetoBetContract.withdraw(betSeedData.remains1);

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).eq(betSeedData.zero);
              expect(user1Balance.locked).eq(betSeedData.lock);

              expect(await this.user1.getBalance()).closeTo(
                betSeedData.accountInitBalance.sub(betSeedData.deposit1).add(betSeedData.remains1),
                betSeedData.error,
              );

              expect(await this.ownerPetoBetContract.getBalance()).eq(
                betSeedData.deposit2.add(betSeedData.lock),
              );
            });

            it("user2 is allowed to withdraw", async function () {
              await this.user2PetoBetContract.withdraw(betSeedData.remains2);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).eq(betSeedData.zero);
              expect(user2Balance.locked).eq(betSeedData.lock);

              expect(await this.user2.getBalance()).closeTo(
                betSeedData.accountInitBalance.sub(betSeedData.deposit2).add(betSeedData.remains2),
                betSeedData.error,
              );

              expect(await this.ownerPetoBetContract.getBalance()).eq(
                betSeedData.deposit1.add(betSeedData.lock),
              );
            });

            it("should throw error when owner tries to transfer funds which were tranfered before", async function () {
              await this.ownerPetoBetContract.transfer(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.feeRate,
              );

              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.thisGameIdWasTranferedBefore));
            });

            it("should throw error when owner tries to transfer using incorrect FROM account", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user3.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.fromAccountWasntVerified));
            });

            it("should throw error when owner tries to transfer using incorrect TO account", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user3.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.toAccountWasntVerified));
            });

            it("user1 is allowed to call transferSig using singnature", async function () {
              const signature = await signMessageForTransferEx(this);

              this.user1PetoBetContract.transferSig(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.feeRate,
                signature,
              );
            });

            it("user2 is allowed to call transferSig using singnature", async function () {
              const signature = await signMessageForTransferEx(this);

              this.user2PetoBetContract.transferSig(
                this.user1.address,
                this.user2.address,
                betSeedData.gameId0,
                betSeedData.feeRate,
                signature,
              );
            });

            it("should throw error when owner tries to transferSig using incorrect FROM account", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user3.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect TO account", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user3.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect gameId", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId1,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect gameId", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId1,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect feeRate", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.incorrectFeeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect signature", async function () {
              let signature = await signMessageForTransferEx(this);

              signature = signature.slice(0, -1) + "f";

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect length of signature", async function () {
              let signature = await signMessageForTransferEx(this);

              signature = signature.slice(0, -2);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.singnatureLengthShouldBe65));
            });

            it("should throw error when user2 tries to withdraw insufficent funds", async function () {
              await expect(this.user2PetoBetContract.withdraw(betSeedData.deposit2)).rejectedWith(
                vmEsceptionText(betErrorMessage.insufficentFunds),
              );
            });

            it("check call transfer with 0 fee", async function () {
              const receipt = await waitTx(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.zero,
                ),
              );

              const event = receipt.events?.find(
                (item) => item.event === EvenName.Transfer,
              ) as TransferEvent;

              expect(event).not.undefined;
              const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
              expect(from).eq(this.user1.address);
              expect(to).eq(this.user2.address);
              expect(gameIdHash).eq(betSeedData.gameIdHash0);
              expect(amount).eq(betSeedData.lock);
              expect(feeRate).eq(betSeedData.zero);
              expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).eq(betSeedData.remains1);
              expect(user1Balance.locked).eq(betSeedData.zero);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).eq(betSeedData.deposit2.add(betSeedData.lock));
              expect(user2Balance.locked).eq(betSeedData.zero);

              expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
              expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
              await checkTotalBalance(this);
            });

            it("should throw error when owner tries to transfer using gameId which does not exist", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId1,
                  betSeedData.zero,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.thisGameDoesNotExist));
            });

            it("check lock event when call transfer", async function () {
              const receipt = await waitTx(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                ),
              );

              const event = receipt.events?.find(
                (item) => item.event === EvenName.Transfer,
              ) as TransferEvent;
              expect(event).not.undefined;
              const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
              expect(from).eq(this.user1.address);
              expect(to).eq(this.user2.address);
              expect(gameIdHash).eq(betSeedData.gameIdHash0);
              expect(amount).eq(betSeedData.lock);
              expect(feeRate).eq(betSeedData.feeRate);
              expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);
            });

            it("should throw error when owner tries to transfer witrh incorrect fee rate", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.incorrectFeeRate,
                ),
              ).rejectedWith(vmEsceptionText(betErrorMessage.feeRateMustBeLess100));
            });

            it("check event when call pairUnlock", async function () {
              const receipt = await waitTx(
                this.ownerPetoBetContract.pairUnlock(betSeedData.gameId0),
              );

              const event = receipt.events?.find(
                (item) => item.event === EvenName.PairUnlock,
              ) as PairLockEvent;
              expect(event).not.undefined;
              const { account1, account2, gameIdHash, amount, timestamp } = event?.args;
              expect(account1).eq(this.user1.address);
              expect(account2).eq(this.user2.address);
              expect(gameIdHash).eq(betSeedData.gameIdHash0);
              expect(amount).eq(betSeedData.lock);
              expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);
            });

            describe("owner unlocked funds of user1 and user2 ", () => {
              beforeEach(async function () {
                await this.ownerPetoBetContract.pairUnlock(betSeedData.gameId0);
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                expect(await this.user1.getBalance()).closeTo(
                  betSeedData.accountInitBalance.sub(betSeedData.deposit1),
                  betSeedData.error,
                );
                expect(await this.user2.getBalance()).closeTo(
                  betSeedData.accountInitBalance.sub(betSeedData.deposit2),
                  betSeedData.error,
                );

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).eq(betSeedData.deposit1);
                expect(user1Balance.locked).eq(betSeedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).eq(betSeedData.deposit2);
                expect(user2Balance.locked).eq(betSeedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
                expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
                await checkTotalBalance(this);
              });

              it("check call unlocked twice", async function () {
                await expect(
                  this.ownerPetoBetContract.pairUnlock(betSeedData.gameId0),
                ).rejectedWith(vmEsceptionText(betErrorMessage.thisGameIdWasTranferedBefore));
              });
            });

            describe("user2 transfered funds from user1 to user2 using signature", () => {
              beforeEach(async function () {
                // await this.ownerPetoBetContract.transfer(
                //   this.user1.address,
                //   this.user2.address,
                //   seedData.gameId0,
                //   seedData.feeRate,
                // );

                const signature = await signMessageForTransferEx(this);

                await this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  betSeedData.gameId0,
                  betSeedData.feeRate,
                  signature,
                );
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                expect(await this.user1.getBalance()).closeTo(
                  betSeedData.accountInitBalance.sub(betSeedData.deposit1),
                  betSeedData.error,
                );
                expect(await this.user2.getBalance()).closeTo(
                  betSeedData.accountInitBalance.sub(betSeedData.deposit2),
                  betSeedData.error,
                );

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).eq(betSeedData.remains1);
                expect(user1Balance.locked).eq(betSeedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).eq(betSeedData.deposit2Win);
                expect(user2Balance.locked).eq(betSeedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.feeBalance);
                expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
                await checkTotalBalance(this);
              });

              it("user1 is allowed to withdraw", async function () {
                await this.user1PetoBetContract.withdraw(betSeedData.remains1);

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).eq(betSeedData.zero);
                expect(user1Balance.locked).eq(betSeedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).eq(betSeedData.deposit2Win);
                expect(user2Balance.locked).eq(betSeedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.feeBalance);
                expect(await this.ownerPetoBetContract.getBalance()).eq(
                  betSeedData.deposit12.sub(betSeedData.remains1),
                );
              });

              it("user2 is allowed to withdraw", async function () {
                await this.user2PetoBetContract.withdraw(betSeedData.deposit2Win);

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).eq(betSeedData.remains1);
                expect(user1Balance.locked).eq(betSeedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).eq(betSeedData.zero);
                expect(user2Balance.locked).eq(betSeedData.zero);

                expect(await this.user2.getBalance()).closeTo(
                  betSeedData.accountInitBalance.add(betSeedData.win),
                  betSeedData.error,
                );

                expect(await this.ownerPetoBetContract.getBalance()).eq(
                  betSeedData.deposit1.sub(betSeedData.win),
                );
              });

              it("should throw error when user1 tries to withdraw insufficent funds", async function () {
                await expect(
                  this.user1PetoBetContract.withdraw(betSeedData.deposit12),
                ).rejectedWith(vmEsceptionText(betErrorMessage.insufficentFunds));
              });

              it("should throw error when user2 tries to withdraw insufficent funds", async function () {
                await expect(
                  this.user2PetoBetContract.withdraw(betSeedData.deposit12),
                ).rejectedWith(vmEsceptionText(betErrorMessage.insufficentFunds));
              });

              it("should throw error when user1 tries to withdraw fee without permission", async function () {
                await expect(
                  this.user1PetoBetContract.withdrawFee(this.user1.address, betSeedData.feeBalance),
                ).rejectedWith(vmEsceptionText(commonErrorMessage.onlyOwner));
              });

              it("should throw error when owner tries to withdraw fee insufficent fund", async function () {
                await expect(
                  this.ownerPetoBetContract.withdrawFee(this.owner.address, betSeedData.deposit1),
                ).rejectedWith(vmEsceptionText(betErrorMessage.insufficentFunds));
              });

              it("check event when call withdrawFee", async function () {
                const receipt = await waitTx(
                  this.ownerPetoBetContract.withdrawFee(this.owner.address, betSeedData.feeBalance),
                );

                const event = receipt.events?.find(
                  (item) => item.event === EvenName.WithdrawFee,
                ) as WithdrawFeeEvent;
                expect(event).not.undefined;
                const { account, amount, timestamp } = event?.args;
                expect(account).eq(this.owner.address);
                expect(amount).eq(betSeedData.feeBalance);
                expect(timestamp).closeTo(getNow(), betSeedData.timeDelta);
              });

              it("check transfer sequentially", async function () {
                await checkTransfer(this, 2);
                await checkTransfer(this, 3);
                await checkTransfer(this, 4);
              });

              describe("owner, user1 and user2 withdrawed their funds", () => {
                beforeEach(async function () {
                  await this.user1PetoBetContract.withdraw(betSeedData.remains1);
                  await this.user2PetoBetContract.withdraw(betSeedData.deposit2Win);
                  await this.ownerPetoBetContract.withdrawFee(
                    this.owner.address,
                    betSeedData.feeBalance,
                  );
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  expect(await this.user1.getBalance()).closeTo(
                    betSeedData.accountInitBalance.sub(betSeedData.lock),
                    betSeedData.error,
                  );
                  expect(await this.user2.getBalance()).closeTo(
                    betSeedData.accountInitBalance.add(betSeedData.win),
                    betSeedData.error,
                  );
                  expect(await this.owner.getBalance()).closeTo(
                    betSeedData.accountInitBalance.add(betSeedData.feeBalance),
                    betSeedData.error,
                  );

                  const user1Balance = await this.ownerPetoBetContract.balanceOf(
                    this.user1.address,
                  );
                  expect(user1Balance.free).eq(betSeedData.zero);
                  expect(user1Balance.locked).eq(betSeedData.zero);

                  const user2Balance = await this.ownerPetoBetContract.balanceOf(
                    this.user2.address,
                  );
                  expect(user2Balance.free).eq(betSeedData.zero);
                  expect(user2Balance.locked).eq(betSeedData.zero);

                  expect(await this.ownerPetoBetContract.getFeeBalance()).eq(betSeedData.zero);
                  expect(await this.ownerPetoBetContract.getBalance()).eq(betSeedData.zero);
                  await checkTotalBalance(this);
                });
              });
            });
          });
        });
      });
    });
  });
}
