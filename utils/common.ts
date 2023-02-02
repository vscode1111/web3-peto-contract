import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish } from "ethers";
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
  let admin: SignerWithAddress | null = null;
  let extText = "";

  if (hre) {
    [admin] = await hre.ethers.getSigners();
    balance0 = toNumber(await admin.getBalance());
    extText = `, balance: ${balance0.toFixed(FRACTION_DIGITS)}`;
  }

  const startMessage = `->Function was started at ${startTime.toLocaleTimeString()}${extText}`;
  console.log(startMessage);
  try {
    await fn();
  } catch (e) {
    console.log(e);
  }
  const finishTime = new Date();
  const diff = ((finishTime.getTime() - startTime.getTime()) / 1000).toFixed();

  if (hre && admin && balance0) {
    balance1 = toNumber(await admin.getBalance());
    diffBalance = balance0 - balance1;
    extText = `, balance: ${balance1.toFixed(FRACTION_DIGITS)}, diff: -${diffBalance.toFixed(
      FRACTION_DIGITS,
    )}`;
  }

  const finishMessage = finishMessageFn
    ? finishMessageFn(diff)
    : `<-Function was finished at ${finishTime.toLocaleTimeString()} in ${diff} sec${extText}`;
  console.log(finishMessage);
}

export async function delay(ms: number): Promise<number> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

export async function verifyContract(
  address: string,
  contractPath: string,
  hre: HardhatRuntimeEnvironment,
  args?: unknown,
): Promise<void> {
  let count = 0;
  const maxTries = 5;

  while (count < maxTries) {
    try {
      console.log("Verifying contract at", address);

      await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
        contract: contractPath, // "contracts/lp-oracle-contracts/mock/Token.sol:Token",
      });
      return;
    } catch (error) {
      count += 1;

      await delay(5000);
    }
  }

  if (count === maxTries) {
    console.log("Failed to verify contract at path %s at address %s", address);
    throw new Error("Verification failed");
  }
}
