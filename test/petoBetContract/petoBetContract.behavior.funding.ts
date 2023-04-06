import { expect } from "chai";
import {
  INITIAL_POSITIVE_CHECK_TEST_TITLE,
  commonErrorMessage,
  getNow,
  vmEsceptionText,
  waitTx,
} from "common";
import { seedData } from "seeds";
import {
  DepositEvent,
  PairLockEvent,
  TransferEvent,
  WithdrawEvent,
  WithdrawFeeEvent,
} from "typechain-types/contracts/PetoBetContract";
import { signMessageForTransferEx } from "utils";

import { errorMessage } from "./testData";
import { EvenName } from "./types";
import { checkTotalBalance, checkTransfer } from "./utils";

export function shouldBehaveCorrectFunding(): void {
  describe("funding", () => {
    describe("first check", () => {
      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        const receipt = await waitTx(
          this.user1PetoBetContract.deposit({ value: seedData.deposit1 }),
        );

        const event = receipt.events?.find(
          (item) => item.event === EvenName.Deposit,
        ) as DepositEvent;
        expect(event).not.undefined;
        const { account, amount, timestamp } = event?.args;
        expect(account).equal(this.user1.address);
        expect(amount).equal(seedData.deposit1);
        expect(timestamp).closeTo(getNow(), seedData.timeDelta);
      });

      describe("user1 deposited funds", () => {
        beforeEach(async function () {
          await this.user1PetoBetContract.deposit({ value: seedData.deposit1 });
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.user1.getBalance()).closeTo(
            seedData.accountInitBalance.sub(seedData.deposit1),
            seedData.error,
          );
          expect(await this.user2.getBalance()).closeTo(
            seedData.accountInitBalance,
            seedData.error,
          );

          const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
          expect(user1Balance.free).equal(seedData.deposit1);
          expect(user1Balance.locked).equal(seedData.zero);

          const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
          expect(user2Balance.free).equal(seedData.zero);
          expect(user2Balance.locked).equal(seedData.zero);

          expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
          expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit1);
          await checkTotalBalance(this);
        });

        it("user1 is allowed to withdraw", async function () {
          const receipt = await waitTx(this.user1PetoBetContract.withdraw(seedData.deposit1));

          const event = receipt.events?.find(
            (item) => item.event === EvenName.Withdraw,
          ) as WithdrawEvent;
          expect(event).not.undefined;
          const { account, amount, timestamp } = event?.args;
          expect(account).equal(this.user1.address);
          expect(amount).equal(seedData.deposit1);
          expect(timestamp).closeTo(getNow(), seedData.timeDelta);

          expect(await this.user1.getBalance()).closeTo(
            seedData.accountInitBalance,
            seedData.error,
          );
          expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.zero);
        });

        it("should throw error when user2 tries to withdraw insufficent funds", async function () {
          await expect(this.user2PetoBetContract.withdraw(seedData.deposit1)).rejectedWith(
            vmEsceptionText(errorMessage.insufficentFunds),
          );
        });

        describe("user2 deposited funds", () => {
          beforeEach(async function () {
            await this.user2PetoBetContract.deposit({ value: seedData.deposit2 });
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.user1.getBalance()).closeTo(
              seedData.accountInitBalance.sub(seedData.deposit1),
              seedData.error,
            );
            expect(await this.user2.getBalance()).closeTo(
              seedData.accountInitBalance.sub(seedData.deposit2),
              seedData.error,
            );

            const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
            expect(user1Balance.free).equal(seedData.deposit1);
            expect(user1Balance.locked).equal(seedData.zero);

            const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
            expect(user2Balance.free).equal(seedData.deposit2);
            expect(user2Balance.locked).equal(seedData.zero);

            expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
            expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit12);
            await checkTotalBalance(this);
          });

          it("user1 is allowed to withdraw", async function () {
            await this.user1PetoBetContract.withdraw(seedData.deposit1);

            const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
            expect(user1Balance.free).equal(seedData.zero);
            expect(user1Balance.locked).equal(seedData.zero);

            expect(await this.user1.getBalance()).closeTo(
              seedData.accountInitBalance,
              seedData.error,
            );

            expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit2);
          });

          it("should throw error when user1 tries to withdraw insufficent funds", async function () {
            await expect(this.user1PetoBetContract.withdraw(seedData.deposit12)).rejectedWith(
              vmEsceptionText(errorMessage.insufficentFunds),
            );
          });

          it("should throw error when user2 tries to withdraw insufficent funds", async function () {
            await expect(this.user2PetoBetContract.withdraw(seedData.deposit12)).rejectedWith(
              vmEsceptionText(errorMessage.insufficentFunds),
            );
          });

          it("check event when call pairLock", async function () {
            const receipt = await waitTx(
              this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.lock,
              ),
            );

            const event = receipt.events?.find(
              (item) => item.event === EvenName.PairLock,
            ) as PairLockEvent;
            expect(event).not.undefined;
            const { account1, account2, gameIdHash, amount, timestamp } = event?.args;
            expect(account1).equal(this.user1.address);
            expect(account2).equal(this.user2.address);
            expect(gameIdHash).equal(seedData.gameIdHash0);
            expect(amount).equal(seedData.lock);
            expect(timestamp).closeTo(getNow(), seedData.timeDelta);
          });

          it("should throw error when owner tries to call pairLock twice", async function () {
            await this.ownerPetoBetContract.pairLock(
              this.user1.address,
              this.user2.address,
              seedData.gameId0,
              seedData.lock,
            );

            await expect(
              this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.lock,
              ),
            ).rejectedWith(vmEsceptionText(errorMessage.thisGameIdWasUsedBefore));
          });

          it("should throw error when user1 tries to call pairLock without permission", async function () {
            await expect(
              this.user1PetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.lock,
              ),
            ).rejectedWith(vmEsceptionText(commonErrorMessage.onlyOwner));
          });

          it("should throw error when user1 tries to call pairUnlock without permissio", async function () {
            await expect(this.user1PetoBetContract.pairUnlock(seedData.gameId0)).rejectedWith(
              vmEsceptionText(commonErrorMessage.onlyOwner),
            );
          });

          it("should throw error when user1 tries to call pairUnlock with non-exist gameId", async function () {
            await expect(this.ownerPetoBetContract.pairUnlock(seedData.gameId0)).rejectedWith(
              vmEsceptionText(errorMessage.thisGameDoesNotExist),
            );
          });

          describe("owner locked funds of user1 and user2", () => {
            beforeEach(async function () {
              await this.ownerPetoBetContract.pairLock(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.lock,
              );
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              expect(await this.user1.getBalance()).closeTo(
                seedData.accountInitBalance.sub(seedData.deposit1),
                seedData.error,
              );
              expect(await this.user2.getBalance()).closeTo(
                seedData.accountInitBalance.sub(seedData.deposit2),
                seedData.error,
              );

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).equal(seedData.remains1);
              expect(user1Balance.locked).equal(seedData.lock);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).equal(seedData.remains2);
              expect(user2Balance.locked).equal(seedData.lock);

              expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
              expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit12);
              await checkTotalBalance(this);
            });

            it("user1 is allowed to withdraw", async function () {
              await this.user1PetoBetContract.withdraw(seedData.remains1);

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).equal(seedData.zero);
              expect(user1Balance.locked).equal(seedData.lock);

              expect(await this.user1.getBalance()).closeTo(
                seedData.accountInitBalance.sub(seedData.deposit1).add(seedData.remains1),
                seedData.error,
              );

              expect(await this.ownerPetoBetContract.getBalance()).equal(
                seedData.deposit2.add(seedData.lock),
              );
            });

            it("user2 is allowed to withdraw", async function () {
              await this.user2PetoBetContract.withdraw(seedData.remains2);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).equal(seedData.zero);
              expect(user2Balance.locked).equal(seedData.lock);

              expect(await this.user2.getBalance()).closeTo(
                seedData.accountInitBalance.sub(seedData.deposit2).add(seedData.remains2),
                seedData.error,
              );

              expect(await this.ownerPetoBetContract.getBalance()).equal(
                seedData.deposit1.add(seedData.lock),
              );
            });

            it("should throw error when owner tries to transfer funds which were tranfered before", async function () {
              await this.ownerPetoBetContract.transfer(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.feeRate,
              );

              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.thisGameIdWasTranferedBefore));
            });

            it("should throw error when owner tries to transfer using incorrect FROM account", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user3.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.fromAccountWasntVerified));
            });

            it("should throw error when owner tries to transfer using incorrect TO account", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user3.address,
                  seedData.gameId0,
                  seedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.toAccountWasntVerified));
            });

            it("user1 is allowed to call transferSig using singnature", async function () {
              const signature = await signMessageForTransferEx(this);

              this.user1PetoBetContract.transferSig(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.feeRate,
                signature,
              );
            });

            it("user2 is allowed to call transferSig using singnature", async function () {
              const signature = await signMessageForTransferEx(this);

              this.user2PetoBetContract.transferSig(
                this.user1.address,
                this.user2.address,
                seedData.gameId0,
                seedData.feeRate,
                signature,
              );
            });

            it("should throw error when owner tries to transferSig using incorrect FROM account", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user3.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect TO account", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user3.address,
                  seedData.gameId0,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect gameId", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId1,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect gameId", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId1,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect feeRate", async function () {
              const signature = await signMessageForTransferEx(this);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.incorrectFeeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect signature", async function () {
              let signature = await signMessageForTransferEx(this);

              signature = signature.slice(0, -1) + "f";

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
            });

            it("should throw error when owner tries to transferSig using incorrect length of signature", async function () {
              let signature = await signMessageForTransferEx(this);

              signature = signature.slice(0, -2);

              await expect(
                this.user2PetoBetContract.transferSig(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                  signature,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.singnatureLengthShouldBe65));
            });

            it("should throw error when user2 tries to withdraw insufficent funds", async function () {
              await expect(this.user2PetoBetContract.withdraw(seedData.deposit2)).rejectedWith(
                vmEsceptionText(errorMessage.insufficentFunds),
              );
            });

            it("check call transfer with 0 fee", async function () {
              const receipt = await waitTx(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.zero,
                ),
              );

              const event = receipt.events?.find(
                (item) => item.event === EvenName.Transfer,
              ) as TransferEvent;

              expect(event).not.undefined;
              const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
              expect(from).equal(this.user1.address);
              expect(to).equal(this.user2.address);
              expect(gameIdHash).equal(seedData.gameIdHash0);
              expect(amount).equal(seedData.lock);
              expect(feeRate).equal(seedData.zero);
              expect(timestamp).closeTo(getNow(), seedData.timeDelta);

              const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
              expect(user1Balance.free).equal(seedData.remains1);
              expect(user1Balance.locked).equal(seedData.zero);

              const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
              expect(user2Balance.free).equal(seedData.deposit2.add(seedData.lock));
              expect(user2Balance.locked).equal(seedData.zero);

              expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
              expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit12);
              await checkTotalBalance(this);
            });

            it("should throw error when owner tries to transfer using gameId which does not exist", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId1,
                  seedData.zero,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.thisGameDoesNotExist));
            });

            it("check lock event when call transfer", async function () {
              const receipt = await waitTx(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.feeRate,
                ),
              );

              const event = receipt.events?.find(
                (item) => item.event === EvenName.Transfer,
              ) as TransferEvent;
              expect(event).not.undefined;
              const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
              expect(from).equal(this.user1.address);
              expect(to).equal(this.user2.address);
              expect(gameIdHash).equal(seedData.gameIdHash0);
              expect(amount).equal(seedData.lock);
              expect(feeRate).equal(seedData.feeRate);
              expect(timestamp).closeTo(getNow(), seedData.timeDelta);
            });

            it("should throw error when owner tries to transfer witrh incorrect fee rate", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.gameId0,
                  seedData.incorrectFeeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.feeRateMustBeLess100));
            });

            it("check event when call pairUnlock", async function () {
              const receipt = await waitTx(this.ownerPetoBetContract.pairUnlock(seedData.gameId0));

              const event = receipt.events?.find(
                (item) => item.event === EvenName.PairUnlock,
              ) as PairLockEvent;
              expect(event).not.undefined;
              const { account1, account2, gameIdHash, amount, timestamp } = event?.args;
              expect(account1).equal(this.user1.address);
              expect(account2).equal(this.user2.address);
              expect(gameIdHash).equal(seedData.gameIdHash0);
              expect(amount).equal(seedData.lock);
              expect(timestamp).closeTo(getNow(), seedData.timeDelta);
            });

            describe("owner unlocked funds of user1 and user2 ", () => {
              beforeEach(async function () {
                await this.ownerPetoBetContract.pairUnlock(seedData.gameId0);
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                expect(await this.user1.getBalance()).closeTo(
                  seedData.accountInitBalance.sub(seedData.deposit1),
                  seedData.error,
                );
                expect(await this.user2.getBalance()).closeTo(
                  seedData.accountInitBalance.sub(seedData.deposit2),
                  seedData.error,
                );

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).equal(seedData.deposit1);
                expect(user1Balance.locked).equal(seedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).equal(seedData.deposit2);
                expect(user2Balance.locked).equal(seedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
                expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit12);
                await checkTotalBalance(this);
              });

              it("check call unlocked twice", async function () {
                await expect(this.ownerPetoBetContract.pairUnlock(seedData.gameId0)).rejectedWith(
                  vmEsceptionText(errorMessage.thisGameIdWasTranferedBefore),
                );
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
                  seedData.gameId0,
                  seedData.feeRate,
                  signature,
                );
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                expect(await this.user1.getBalance()).closeTo(
                  seedData.accountInitBalance.sub(seedData.deposit1),
                  seedData.error,
                );
                expect(await this.user2.getBalance()).closeTo(
                  seedData.accountInitBalance.sub(seedData.deposit2),
                  seedData.error,
                );

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).equal(seedData.remains1);
                expect(user1Balance.locked).equal(seedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).equal(seedData.deposit2Win);
                expect(user2Balance.locked).equal(seedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.feeBalance);
                expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.deposit12);
                await checkTotalBalance(this);
              });

              it("user1 is allowed to withdraw", async function () {
                await this.user1PetoBetContract.withdraw(seedData.remains1);

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).equal(seedData.zero);
                expect(user1Balance.locked).equal(seedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).equal(seedData.deposit2Win);
                expect(user2Balance.locked).equal(seedData.zero);

                expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.feeBalance);
                expect(await this.ownerPetoBetContract.getBalance()).equal(
                  seedData.deposit12.sub(seedData.remains1),
                );
              });

              it("user2 is allowed to withdraw", async function () {
                await this.user2PetoBetContract.withdraw(seedData.deposit2Win);

                const user1Balance = await this.ownerPetoBetContract.balanceOf(this.user1.address);
                expect(user1Balance.free).equal(seedData.remains1);
                expect(user1Balance.locked).equal(seedData.zero);

                const user2Balance = await this.ownerPetoBetContract.balanceOf(this.user2.address);
                expect(user2Balance.free).equal(seedData.zero);
                expect(user2Balance.locked).equal(seedData.zero);

                expect(await this.user2.getBalance()).closeTo(
                  seedData.accountInitBalance.add(seedData.win),
                  seedData.error,
                );

                expect(await this.ownerPetoBetContract.getBalance()).equal(
                  seedData.deposit1.sub(seedData.win),
                );
              });

              it("should throw error when user1 tries to withdraw insufficent funds", async function () {
                await expect(this.user1PetoBetContract.withdraw(seedData.deposit12)).rejectedWith(
                  vmEsceptionText(errorMessage.insufficentFunds),
                );
              });

              it("should throw error when user2 tries to withdraw insufficent funds", async function () {
                await expect(this.user2PetoBetContract.withdraw(seedData.deposit12)).rejectedWith(
                  vmEsceptionText(errorMessage.insufficentFunds),
                );
              });

              it("should throw error when user1 tries to withdraw fee without permission", async function () {
                await expect(
                  this.user1PetoBetContract.withdrawFee(this.user1.address, seedData.feeBalance),
                ).rejectedWith(vmEsceptionText(commonErrorMessage.onlyOwner));
              });

              it("should throw error when owner tries to withdraw fee insufficent fund", async function () {
                await expect(
                  this.ownerPetoBetContract.withdrawFee(this.owner.address, seedData.deposit1),
                ).rejectedWith(vmEsceptionText(errorMessage.insufficentFunds));
              });

              it("check event when call withdrawFee", async function () {
                const receipt = await waitTx(
                  this.ownerPetoBetContract.withdrawFee(this.owner.address, seedData.feeBalance),
                );

                const event = receipt.events?.find(
                  (item) => item.event === EvenName.WithdrawFee,
                ) as WithdrawFeeEvent;
                expect(event).not.undefined;
                const { account, amount, timestamp } = event?.args;
                expect(account).equal(this.owner.address);
                expect(amount).equal(seedData.feeBalance);
                expect(timestamp).closeTo(getNow(), seedData.timeDelta);
              });

              it("check transfer sequentially", async function () {
                await checkTransfer(this, 2);
                await checkTransfer(this, 3);
                await checkTransfer(this, 4);
              });

              describe("owner, user1 and user2 withdrawed their funds", () => {
                beforeEach(async function () {
                  await this.user1PetoBetContract.withdraw(seedData.remains1);
                  await this.user2PetoBetContract.withdraw(seedData.deposit2Win);
                  await this.ownerPetoBetContract.withdrawFee(
                    this.owner.address,
                    seedData.feeBalance,
                  );
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  expect(await this.user1.getBalance()).closeTo(
                    seedData.accountInitBalance.sub(seedData.lock),
                    seedData.error,
                  );
                  expect(await this.user2.getBalance()).closeTo(
                    seedData.accountInitBalance.add(seedData.win),
                    seedData.error,
                  );
                  expect(await this.owner.getBalance()).closeTo(
                    seedData.accountInitBalance.add(seedData.feeBalance),
                    seedData.error,
                  );

                  const user1Balance = await this.ownerPetoBetContract.balanceOf(
                    this.user1.address,
                  );
                  expect(user1Balance.free).equal(seedData.zero);
                  expect(user1Balance.locked).equal(seedData.zero);

                  const user2Balance = await this.ownerPetoBetContract.balanceOf(
                    this.user2.address,
                  );
                  expect(user2Balance.free).equal(seedData.zero);
                  expect(user2Balance.locked).equal(seedData.zero);

                  expect(await this.ownerPetoBetContract.getFeeBalance()).equal(seedData.zero);
                  expect(await this.ownerPetoBetContract.getBalance()).equal(seedData.zero);
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
