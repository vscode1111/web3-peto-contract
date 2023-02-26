import { toWei } from "common";
import { BigNumber } from "ethers";

const PROD_DATA = false;
const PRICE_DIV = BigNumber.from(PROD_DATA ? "1" : "1000");

const accountInitBalance = toWei(10000);
const deposit1 = toWei(100).div(PRICE_DIV);
const deposit2 = deposit1.mul(2);
const lock = toWei(10).div(PRICE_DIV);
const win = toWei(8).div(PRICE_DIV);
const feeBalance = toWei(2).div(PRICE_DIV);

export const seedData = {
  zero: toWei(0),
  accountInitBalance,
  totalAccountBalance: accountInitBalance.mul(3),
  deposit1,
  deposit2,
  lock,
  deposit12: deposit1.add(deposit2),
  remains1: deposit1.sub(lock),
  remains2: deposit2.sub(lock),
  feeRate: toWei(20),
  incorrectFeeRate: toWei(101),
  feeBalance,
  win,
  deposit2Win: deposit2.add(win),
  error: toWei(0.01),
  timeDelta: 300,
};

export const errorMessage = {
  insufficentFunds: "Insufficent funds",
  lockedFundsFromAccount:
    "Locked funds of FROM account must be equal to or greater than the amount",
  feeRateMustBeLess100: "feeRate must be less 100",
};
