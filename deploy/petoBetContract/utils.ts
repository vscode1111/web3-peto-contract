import { printBigNumber } from "common";
import { BigNumber } from "ethers";
import { PetoBetContract } from "typechain-types/contracts/PetoBetContract";

export function printUserBalance(userBalance: PetoBetContract.FundItemStructOutput) {
  console.log(
    `user1 free:${printBigNumber(userBalance.free)}, locked:${printBigNumber(userBalance.locked)}`,
  );
}

export function printFeeBalance(feeBalance: BigNumber) {
  console.log(`fee balance:${printBigNumber(feeBalance)}`);
}
