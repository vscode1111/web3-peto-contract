import { expect } from "chai";
import { attempt, getNow, waitTx } from "common";
import { printUserBalance } from "deploy/petoBetContract/utils";
import { BigNumber } from "ethers";
import { seedData } from "seeds";
import {
  DepositEvent,
  PairLockEvent,
  TransferEvent,
  WithdrawEvent,
  WithdrawFeeEvent,
} from "typechain-types/contracts/PetoBetContract";
import { signMessageForTransferEx } from "utils";

import { EvenName, PetoBetContextBase } from "./types";
import { BalanceObject, getTotalBalance } from "./utils";

export async function smokeTest(that: PetoBetContextBase) {
  const accounts: BalanceObject[] = [that.user1, that.user2, that.owner, that.ownerPetoBetContract];
  const totalBalance = await getTotalBalance(accounts);

  const ownerInitBalance = await that.owner.getBalance();
  expect(ownerInitBalance).greaterThan(seedData.zero);
  const user1InitBalance = await that.user1.getBalance();
  expect(user1InitBalance).greaterThan(seedData.lock);
  const user2InitBalance = await that.user2.getBalance();
  expect(user2InitBalance).greaterThan(seedData.lock);

  await user1DepositesTokens(that);
  await user2DepositesTokens(that);
  await checkUserBalances(that);
  await ownerPairLockTokens(that);

  // await ownerTransfersTokens(that);
  await checkGameItem(that);
  await user2TransfersSigTokens(that);
  await ownerWithdrawsFeeTokens(that, ownerInitBalance);
  await user1WithdrawsTokens(that, user1InitBalance);
  await user2WithdrawsTokens(that, user2InitBalance);

  expect(await getTotalBalance(accounts)).closeTo(totalBalance, seedData.bigError);
}

const labels = {
  smokeTest: "Smoke test",
  user1DepositesTokens: "--User1 deposites tokens",
  user2DepositesTokens: "--User2 deposites tokens",
  checkUserBalances: "--Check user's balances",
  ownerPairLocksTokens: "--Owner pairLocks tokens",
  checkGameItem: "--Check gameItem",
  ownerTranfersTokens: "--Owner transfers tokens",
  user2TranfersSigTokens: "--User2 transfers tokens using signature",
  user1WithdrawsTokens: "--User1 withdraws tokens",
  user2WithdrawsTokens: "--User2 withdraws tokens",
  ownerWithdrawsFeeTokens: "--Owner withdraws fee tokens",
};

export async function user1DepositesTokens(that: PetoBetContextBase) {
  console.log(labels.user1DepositesTokens);

  const receipt = await waitTx(
    that.user1PetoBetContract.deposit({ value: seedData.deposit1 }),
    "deposit",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Deposit) as DepositEvent;
  expect(event).not.undefined;
  const { account, amount, timestamp } = event?.args;
  expect(account).equal(that.user1.address);
  expect(amount).equal(seedData.deposit1);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);
}

export async function user2DepositesTokens(that: PetoBetContextBase) {
  console.log(labels.user2DepositesTokens);

  const receipt = await waitTx(
    that.user2PetoBetContract.deposit({ value: seedData.deposit2 }),
    "deposit",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Deposit) as DepositEvent;
  expect(event).not.undefined;
  const { account, amount, timestamp } = event?.args;
  expect(account).equal(that.user2.address);
  expect(amount).equal(seedData.deposit2);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);
}

export async function checkUserBalances(that: PetoBetContextBase) {
  console.log(labels.checkUserBalances);

  await attempt(
    async () => {
      const user1Balance = await that.user1PetoBetContract.balanceOf(that.user1.address);
      printUserBalance(user1Balance, "user1");
      expect(user1Balance.free).greaterThanOrEqual(seedData.deposit1);
      expect(user1Balance.locked).greaterThanOrEqual(seedData.zero);

      const user2Balance = await that.user1PetoBetContract.balanceOf(that.user2.address);
      printUserBalance(user2Balance, "user2");
      expect(user2Balance.free).greaterThanOrEqual(seedData.deposit1);
      expect(user2Balance.locked).greaterThanOrEqual(seedData.zero);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerPairLockTokens(that: PetoBetContextBase) {
  console.log(labels.ownerPairLocksTokens);
  console.log(`gameId: ${seedData.gameId0}`);

  const receipt = await waitTx(
    that.ownerPetoBetContract.pairLock(
      that.user1.address,
      that.user2.address,
      seedData.gameId0,
      seedData.lock,
    ),
    "pairLock",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.PairLock) as PairLockEvent;
  expect(event).not.undefined;
  const { account1, account2, gameIdHash, amount, timestamp } = event?.args;
  expect(account1).equal(that.user1.address);
  expect(account2).equal(that.user2.address);
  expect(gameIdHash).equal(seedData.gameIdHash0);
  expect(amount).equal(seedData.lock);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);
}

export async function checkGameItem(that: PetoBetContextBase) {
  console.log(labels.checkGameItem);

  await attempt(
    async () => {
      const [, gameItem] = await that.user1PetoBetContract.getGameItem(seedData.gameId0);
      const { account1, account2, amount, transfered } = gameItem;

      console.table({
        account1,
        account2,
        amount: gameItem.amount.toString(),
        transfered,
      });

      expect(account1).not.eq(seedData.zeroAddress);
      expect(account2).not.eq(seedData.zeroAddress);
      expect(amount).greaterThanOrEqual(seedData.zero);
      expect(transfered).eq(false);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerTransfersTokens(that: PetoBetContextBase) {
  console.log(labels.ownerTranfersTokens);
  console.log(`gameId: ${seedData.gameId0}`);

  const receipt = await waitTx(
    that.ownerPetoBetContract.transfer(
      that.user1.address,
      that.user2.address,
      seedData.gameId0,
      seedData.feeRate,
    ),
    "transfer",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Transfer) as TransferEvent;
  expect(event).not.undefined;
  const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
  expect(from).equal(that.user1.address);
  expect(to).equal(that.user2.address);
  expect(gameIdHash).equal(seedData.gameIdHash0);
  expect(amount).equal(seedData.lock);
  expect(feeRate).equal(seedData.feeRate);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);
}

export async function user2TransfersSigTokens(that: PetoBetContextBase) {
  console.log(labels.user2TranfersSigTokens);
  console.log(`gameId: ${seedData.gameId0}`);

  const signature = await signMessageForTransferEx(that);
  console.log(`signature: ${signature}`);

  const receipt = await waitTx(
    that.user2PetoBetContract.transferSig(
      that.user1.address,
      that.user2.address,
      seedData.gameId0,
      seedData.feeRate,
      signature,
    ),
    "transferSig",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Transfer) as TransferEvent;
  expect(event).not.undefined;
  const { from, to, gameIdHash, amount, feeRate, timestamp } = event?.args;
  expect(from).equal(that.user1.address);
  expect(to).equal(that.user2.address);
  expect(gameIdHash).equal(seedData.gameIdHash0);
  expect(amount).equal(seedData.lock);
  expect(feeRate).equal(seedData.feeRate);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);
}

export async function ownerWithdrawsFeeTokens(
  that: PetoBetContextBase,
  ownerInitBalance: BigNumber,
) {
  console.log(labels.ownerWithdrawsFeeTokens);

  const receipt = await waitTx(
    that.ownerPetoBetContract.withdrawFee(that.owner.address, seedData.feeBalance),
    "withdrawFee",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find(
    (item) => item.event === EvenName.WithdrawFee,
  ) as WithdrawFeeEvent;
  expect(event).not.undefined;
  const { account, amount, timestamp } = event?.args;
  expect(account).equal(that.owner.address);
  expect(amount).equal(seedData.feeBalance);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);

  expect(await that.owner.getBalance()).closeTo(
    ownerInitBalance.add(seedData.feeBalance),
    seedData.bigError,
  );
}

export async function user1WithdrawsTokens(that: PetoBetContextBase, user1InitBalance: BigNumber) {
  console.log(labels.user1WithdrawsTokens);

  const receipt = await waitTx(
    that.user1PetoBetContract.withdraw(seedData.remains1),
    "withdraw",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Withdraw) as WithdrawEvent;
  expect(event).not.undefined;
  const { account, amount, timestamp } = event?.args;
  expect(account).equal(that.user1.address);
  expect(amount).equal(seedData.remains1);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);

  expect(await that.user1.getBalance()).closeTo(
    user1InitBalance.sub(seedData.deposit1).add(seedData.remains1),
    seedData.bigError,
  );
}

export async function user2WithdrawsTokens(that: PetoBetContextBase, user2InitBalance: BigNumber) {
  console.log(labels.user2WithdrawsTokens);

  const receipt = await waitTx(
    that.user2PetoBetContract.withdraw(seedData.deposit2Win),
    "withdraw",
    seedData.attemps,
    seedData.delayMs,
  );

  const event = receipt.events?.find((item) => item.event === EvenName.Withdraw) as WithdrawEvent;
  expect(event).not.undefined;
  const { account, amount, timestamp } = event?.args;
  expect(account).equal(that.user2.address);
  expect(amount).equal(seedData.deposit2Win);
  expect(timestamp).closeTo(getNow(), seedData.timeDelta);

  expect(await that.user2.getBalance()).closeTo(
    user2InitBalance.add(seedData.win),
    seedData.bigError,
  );
}

export function shouldBehaveCorrectSmokeTest(): void {
  describe("smoke test", () => {
    it(labels.smokeTest, async function () {
      await smokeTest(this);
    });
  });
}
