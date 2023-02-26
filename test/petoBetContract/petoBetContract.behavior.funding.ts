import { expect } from "chai";
import {
  INITIAL_POSITIVE_CHECK_TEST_TITLE,
  commonErrorMessage,
  getNow,
  vmEsceptionText,
  waitForTx,
} from "common";
import { seedData } from "seeds";
import {
  DepositEvent,
  LockEvent,
  TransferEvent,
  WithdrawEvent,
  WithdrawFeeEvent,
} from "typechain-types/contracts/PetoBetContract";

import { errorMessage } from "./testData";
import { checkTotalBalance } from "./utils";

export function shouldBehaveCorrectFunding(): void {
  describe("funding", () => {
    describe("first check", () => {
      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        const receipt = await waitForTx(
          this.user1PetoBetContract.deposit({ value: seedData.deposit1 }),
        );

        const tokenSoldEvent = receipt.events?.find(
          (item) => item.event === "Deposit",
        ) as DepositEvent;
        expect(tokenSoldEvent).not.undefined;
        const { account, amount, timestamp } = tokenSoldEvent?.args;
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
          const receipt = await waitForTx(this.user1PetoBetContract.withdraw(seedData.deposit1));

          const tokenSoldEvent = receipt.events?.find(
            (item) => item.event === "Withdraw",
          ) as WithdrawEvent;
          expect(tokenSoldEvent).not.undefined;
          const { account, amount, timestamp } = tokenSoldEvent?.args;
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

          it("check event when call lockPair", async function () {
            const receipt = await waitForTx(
              this.ownerPetoBetContract.lockPair(
                this.user1.address,
                this.user2.address,
                seedData.lock,
              ),
            );

            const tokenSoldEvents = receipt.events?.filter(
              (item) => item.event === "Lock",
            ) as LockEvent[];

            expect(tokenSoldEvents.length).equal(2);

            let tokenSoldEvent = tokenSoldEvents[0];
            expect(tokenSoldEvent).not.undefined;
            const { args: args1 } = tokenSoldEvent;
            expect(args1?.account).equal(this.user1.address);
            expect(args1?.amount).equal(seedData.lock);
            expect(args1?.timestamp).closeTo(getNow(), seedData.timeDelta);

            tokenSoldEvent = tokenSoldEvents[1];
            expect(tokenSoldEvent).not.undefined;
            const { args: args2 } = tokenSoldEvent;
            expect(args2?.account).equal(this.user2.address);
            expect(args2?.amount).equal(seedData.lock);
            expect(args2?.timestamp).closeTo(getNow(), seedData.timeDelta);
          });

          it("should throw error when user1 tries to call lockPair without permission", async function () {
            await expect(
              this.user1PetoBetContract.lockPair(
                this.user1.address,
                this.user2.address,
                seedData.lock,
              ),
            ).rejectedWith(vmEsceptionText(commonErrorMessage.onlyOwner));
          });

          describe("owner locked funds of user1 and user2", () => {
            beforeEach(async function () {
              await this.ownerPetoBetContract.lockPair(
                this.user1.address,
                this.user2.address,
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

            it("should throw error when user2 tries to withdraw insufficent funds", async function () {
              await expect(this.user2PetoBetContract.withdraw(seedData.deposit2)).rejectedWith(
                vmEsceptionText(errorMessage.insufficentFunds),
              );
            });

            it("check lock event when call transfer", async function () {
              const receipt = await waitForTx(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.lock,
                  seedData.feeRate,
                ),
              );

              const tokenSoldEvent = receipt.events?.find(
                (item) => item.event === "Transfer",
              ) as TransferEvent;

              expect(tokenSoldEvent).not.undefined;

              const { from, to, amount, feeRate, timestamp } = tokenSoldEvent?.args;

              expect(from).equal(this.user1.address);
              expect(to).equal(this.user2.address);
              expect(amount).equal(seedData.lock);
              expect(feeRate).equal(seedData.feeRate);
              expect(timestamp).closeTo(getNow(), seedData.timeDelta);
            });

            it("should throw error when owner tries to transfer from user who has no certain amount of locked funds", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.deposit1,
                  seedData.feeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.lockedFundsFromAccount));
            });

            it("should throw error when owner tries to transfer from user who has no certain amount of locked funds", async function () {
              await expect(
                this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.lock,
                  seedData.incorrectFeeRate,
                ),
              ).rejectedWith(vmEsceptionText(errorMessage.feeRateMustBeLess100));
            });

            describe("owner transfered funds from user1 to user2 with some interest", () => {
              beforeEach(async function () {
                await this.ownerPetoBetContract.transfer(
                  this.user1.address,
                  this.user2.address,
                  seedData.lock,
                  seedData.feeRate,
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
                const receipt = await waitForTx(
                  this.ownerPetoBetContract.withdrawFee(this.owner.address, seedData.feeBalance),
                );

                const tokenSoldEvent = receipt.events?.find(
                  (item) => item.event === "WithdrawFee",
                ) as WithdrawFeeEvent;
                expect(tokenSoldEvent).not.undefined;
                const { account, amount, timestamp } = tokenSoldEvent?.args;
                expect(account).equal(this.owner.address);
                expect(amount).equal(seedData.feeBalance);
                expect(timestamp).closeTo(getNow(), seedData.timeDelta);
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
