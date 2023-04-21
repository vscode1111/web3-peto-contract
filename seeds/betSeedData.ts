import { keccak256FromStr, toWei } from "@common";
import { DeployNetworks } from "@types";
import { BigNumber } from "ethers";
import { v4 as uuidv4 } from "uuid";

import { defaultNetwork } from "../hardhat.config";

const chainDiv: Record<keyof DeployNetworks, string> = {
  polygon: "1000",
  opera: "1000",
  bsc: "100000",
  okc: "100000",
  kcc: "100000",
};

const PROD_DATA = false;

const PRICE_DIV = BigNumber.from(PROD_DATA ? "1" : chainDiv[defaultNetwork]);

const accountInitBalance = toWei(10000);
const deposit1 = toWei(100).div(PRICE_DIV);
const deposit2 = deposit1.mul(2);
const lock = toWei(10).div(PRICE_DIV);
const win = toWei(8).div(PRICE_DIV);
const feeBalance = toWei(2).div(PRICE_DIV);
const gameId0 = uuidv4();
const gameId1 = uuidv4();

export const betSeedData = {
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
  gameIdForce: "c21c2dd4-3d72-4208-974e-b97273bf1e39",
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
