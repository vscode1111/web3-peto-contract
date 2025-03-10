import { DeployNetworks } from "@types";
import { ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import _ from "lodash";

import { DiffArray } from "./DiffArray";
import { toNumber } from "./converts";

export const DECIMAL_FACTOR = 1e18;
export const FRACTION_DIGITS = 3;

export async function getBalances() {
  const users = await ethers.getSigners();
  return Promise.all(users.map(async (user) => toNumber(await user.getBalance())));
}

export function printBalances(balances?: number[]) {
  return `${balances?.map((balance) => balance.toFixed(FRACTION_DIGITS)).join(", ")}`;
}
export function printSum(balances?: number[]) {
  return _.sum(balances).toFixed(FRACTION_DIGITS);
}

export async function callWithTimer(fn: () => Promise<void>) {
  const startTime = new Date();
  await fn();
  const finishTime = new Date();
  return (finishTime.getTime() - startTime.getTime()) / 1000;
}

export async function callWithTimerHre(
  fn: () => Promise<void>,
  hre?: HardhatRuntimeEnvironment,
  finishMessageFn?: (diff: string) => string,
) {
  const startTime = new Date();
  let diffArray;
  let extText = "";

  if (hre) {
    const {
      network: { name },
    } = hre;

    const balances = await getBalances();
    diffArray = new DiffArray(balances);
    extText = `, network: ${name}, balances: ${printBalances(balances)} = ${_.sum(balances).toFixed(
      FRACTION_DIGITS,
    )}`;
  }

  const startMessage = `->Function was started at ${startTime.toLocaleTimeString()}${extText}`;
  console.log(startMessage);
  await fn();
  const finishTime = new Date();
  const diff = ((finishTime.getTime() - startTime.getTime()) / 1000).toFixed(1);

  if (hre) {
    const balances = await getBalances();
    const costDiff = diffArray?.diff(balances);
    extText = `, balances: ${printBalances(balances)} = ${printSum(
      balances,
    )}, costs: ${printBalances(costDiff)} = ${printSum(costDiff)}`;
  }

  const finishMessage = finishMessageFn
    ? finishMessageFn(diff)
    : `<-Function was finished at ${finishTime.toLocaleTimeString()} in ${diff} sec${extText}`;
  console.log(finishMessage);
}

export async function delay(ms: number): Promise<number> {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

// https://github.com/astra-net/astra-scan.backend/blob/8f9618d8d4df0976b5544b75ed5636b2ef949acd/src/indexer/rpc/transport/ws/WebSocketRPC.ts
export function timeoutPromise(callTimeout: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout error in ${callTimeout}ms`)), callTimeout),
  );
}

export async function verifyContract(
  address: string,
  hre: HardhatRuntimeEnvironment,
  args?: unknown,
): Promise<void> {
  let count = 0;
  const maxTries = 5;

  while (count < maxTries) {
    try {
      console.log(`=>Attempt #${count + 1} to verifying contract at ${address}...`);
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
      });
      return;
    } catch (error) {
      console.log(error);
      const errorObj = error as object;
      if (
        "message" in errorObj &&
        typeof errorObj.message === "string" &&
        errorObj.message.includes("Already Verified")
      ) {
        break;
      }

      count += 1;
      await delay(5000);
    }
  }

  if (count === maxTries) {
    console.log("Failed to verify contract address %s", address);
    throw new Error("Verification failed");
  }
}

export async function attempt(fn: () => Promise<any>, attempts = 3, delayMs = 1000): Promise<any> {
  try {
    return await fn();
  } catch (e) {
    if (attempts > 0) {
      console.log(e);
      await delay(delayMs);
      console.log(`${attempts - 1} attempts left`);
      return await attempt(fn, attempts - 1, delayMs);
    } else {
      throw e;
    }
  }
}

export async function waitTx(
  promise: Promise<ContractTransaction>,
  functionName?: string,
  attempts = 3,
  delayMs = 1000,
): Promise<ContractReceipt> {
  return attempt(
    async () => {
      let receipt!: ContractReceipt;
      const time = await callWithTimer(async function () {
        if (functionName) {
          console.log(`TX: ${functionName} ...`);
        }
        const tx = await promise;
        if (functionName) {
          console.log(`TX: ${functionName} hash: ${tx.hash} ...`);
        }
        receipt = await tx.wait();
      });

      if (functionName && receipt) {
        const gas = receipt.gasUsed;
        const price = toNumber(
          receipt.effectiveGasPrice
            ? gas.mul(receipt.effectiveGasPrice)
            : receipt.cumulativeGasUsed,
        );
        console.log(
          `TX: ${functionName} time: ${time.toFixed(1)} sec, gas: ${gas}, fee: ${price.toFixed(
            FRACTION_DIGITS,
          )}`,
        );
      }
      return receipt;
    },
    attempts,
    delayMs,
  );
}

export function getNetworkName(hre: HardhatRuntimeEnvironment): keyof DeployNetworks {
  const {
    network: { name },
  } = hre;

  return name as keyof DeployNetworks;
}
