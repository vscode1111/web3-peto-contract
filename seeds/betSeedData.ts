import { keccak256FromStr, toWei } from "common";
import { BigNumber } from "ethers";
import { v4 as uuidv4 } from "uuid";

const PROD_DATA = false;
const PRICE_DIV = BigNumber.from(PROD_DATA ? "1" : "1000");

const accountInitBalance = toWei(10000);
const deposit1 = toWei(100).div(PRICE_DIV);
const deposit2 = deposit1.mul(2);
const lock = toWei(10).div(PRICE_DIV);
const win = toWei(8).div(PRICE_DIV);
const feeBalance = toWei(2).div(PRICE_DIV);
const gameId0 = uuidv4();
const gameId1 = uuidv4();

export const seedData = {
  zero: toWei(0),
  zeroAddress: "0x0000000000000000000000000000000000000000",
  accountInitBalance,
  totalAccountBalance: accountInitBalance.mul(3),
  deposit1,
  deposit2,
  lock,
  deposit12: deposit1.add(deposit2),
  remains1: deposit1.sub(lock),
  remains2: deposit2.sub(lock),
  feeRate: toWei(20),
  // feeRate: toWei(0),
  incorrectFeeRate: toWei(101),
  feeBalance,
  win,
  deposit2Win: deposit2.add(win),
  error: toWei(0.01),
  bigError: toWei(0.3),
  timeDelta: 300,
  // gameId0: "733416dd-d12f-4fb7-9438-7835abe717b6",
  // gameId1: "733efc1e-0115-4f2c-b8a2-9b83e28b616f",
  // gameIdHash0: "0x2ae807746a02e6bb9d4edbbc0e1b276ae2b9af6474903cb3b8778a094b8fb6f8",
  // gameIdHash1: "0x8553b156ad297e38d262f2e9427b7f104ce9cdf47ba3afb8e167e710f8a8bcc6",
  gameIdForce: "test-007",
  signatureForce:
    "0x6ca1f91cf29e4fb5ed57a194cf64337a6f83b6da8cbd4cd8b040c19bd9b3b0f660f55fd22bb484ab9c60de6f5a54dc5483e80cb51e2877e86c325fb31123bbdb1c",
  gameId0,
  gameId1,
  gameIdHash0: keccak256FromStr(gameId0),
  gameIdHash1: keccak256FromStr(gameId1),
  attemps: 5,
  delayMs: 5000,
};

export const errorMessage = {
  insufficentFunds: "Insufficent funds",
  lockedFundsFromAccount:
    "Locked funds of FROM account must be equal to or greater than the amount",
  feeRateMustBeLess100: "feeRate must be less 100",
};
