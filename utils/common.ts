import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StringNumber } from "types/common";

export function toWei(value: StringNumber, unitName?: BigNumberish): BigNumber {
  return ethers.utils.parseUnits(String(value), unitName);
}

export function toNumber(value: BigNumber, factor = 1): number {
  return Number(ethers.utils.formatEther(value)) * factor;
}

export function toUnixTime(value: string | Date = new Date()): number {
  return Math.floor(new Date(value).getTime() / 1000);
}

export function numberToByteArray(value: number, bytesNumber = 4): number[] {
  var byteArray = new Array(bytesNumber).fill(0);

  for (var index = byteArray.length - 1; index >= 0; index--) {
    var byte = value & 0xff;
    byteArray[index] = byte;
    value = (value - byte) / 256;
  }

  return byteArray;
}

export function byteArrayToNumber(byteArray: number[]): number {
  var value = 0;
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }

  return value;
}

const FRACTION_DIGITS = 3;

export async function callWithTimer(
  fn: () => Promise<void>,
  hre?: HardhatRuntimeEnvironment,
  finishMessageFn?: (diff: string) => string,
) {
  const startTime = new Date();
  let balance0, balance1, diffBalance: number;
  let owner: SignerWithAddress | null = null;
  let extText = "";

  if (hre) {
    const {
      network: { name },
    } = hre;

    [owner] = await hre.ethers.getSigners();
    balance0 = toNumber(await owner.getBalance());
    extText = `, network: ${name}, balance: ${balance0.toFixed(FRACTION_DIGITS)}`;
  }

  const startMessage = `->Function was started at ${startTime.toLocaleTimeString()}${extText}`;
  console.log(startMessage);
  try {
    await fn();
  } catch (e) {
    console.log(e);
  }
  const finishTime = new Date();
  const diff = ((finishTime.getTime() - startTime.getTime()) / 1000).toFixed(1);

  if (hre && owner && balance0) {
    balance1 = toNumber(await owner.getBalance());
    diffBalance = balance0 - balance1;
    extText = `, balance: ${balance1.toFixed(FRACTION_DIGITS)}, cost: ${diffBalance.toFixed(
      FRACTION_DIGITS,
    )}`;
  }

  const finishMessage = finishMessageFn
    ? finishMessageFn(diff)
    : `<-Function was finished at ${finishTime.toLocaleTimeString()} in ${diff} sec${extText}`;
  console.log(finishMessage);
}

export async function delay(ms: number): Promise<number> {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
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
      count += 1;
      await delay(5000);
    }
  }

  if (count === maxTries) {
    console.log("Failed to verify contract address %s", address);
    throw new Error("Verification failed");
  }
}

export async function waitForTx(
  promise: Promise<ContractTransaction>,
  functionName?: string,
  // confirmations = 1
): Promise<ContractReceipt> {
  if (functionName) {
    console.log(`TX: calling ${functionName}...`);
  }
  // return promise.then((tx) => {
  //   if (functionName) {
  //     console.log(`TX: waiting ${functionName}...`);
  //   }
  //   // tx.wait(confirmations);
  //   tx.wait();
  //   return tx;
  // });
  const tx = await promise;

  if (functionName) {
    console.log(`TX: waiting ${functionName} hash: ${tx.hash}...`);
  }

  const receipt = await tx.wait();
  return receipt;
}
