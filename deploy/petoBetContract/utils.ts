import { printBigNumber } from "@common";
import { PetoBetContract } from "@typechain-types/contracts/PetoBetContract";
import { BigNumber } from "ethers";

export function printUserBalance(userBalance: PetoBetContract.FundItemStructOutput, name = "user") {
  console.log(
    `${name} free: ${printBigNumber(userBalance.free)}, locked: ${printBigNumber(
      userBalance.locked,
    )}`,
  );
}

export function printFeeBalance(feeBalance: BigNumber) {
  console.log(`fee balance: ${printBigNumber(feeBalance)}`);
}
