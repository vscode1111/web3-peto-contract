import { betSeedData } from "@seeds";
import { expect } from "chai";
import { BigNumber } from "ethers";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

import { PetoBetContextBase } from "./types";

export interface BalanceObject {
  getBalance: () => Promise<BigNumber>;
}

export async function getTotalBalance(objects: BalanceObject[]): Promise<BigNumber> {
  const result = await Promise.all(objects.map((obj) => obj.getBalance()));
  return result.reduce((acc, cur) => acc.add(cur), betSeedData.zero);
}

export async function checkTotalBalance(that: PetoBetContextBase) {
  expect(
    await getTotalBalance([that.user1, that.user2, that.owner, that.ownerPetoBetContract]),
  ).closeTo(betSeedData.totalAccountBalance, betSeedData.error);
}

export async function checkTransfer(that: PetoBetContextBase, iterationNumber: number) {
  const gameId = uuidv4();

  await that.ownerPetoBetContract.pairLock(
    that.user1.address,
    that.user2.address,
    gameId,
    betSeedData.lock,
  );

  await that.ownerPetoBetContract.transfer(
    that.user1.address,
    that.user2.address,
    gameId,
    betSeedData.feeRate,
  );

  expect(await that.user1.getBalance()).closeTo(
    betSeedData.accountInitBalance.sub(betSeedData.deposit1),
    betSeedData.error,
  );
  expect(await that.user2.getBalance()).closeTo(
    betSeedData.accountInitBalance.sub(betSeedData.deposit2),
    betSeedData.error,
  );
  expect(await that.ownerPetoBetContract.getFeeBalance()).eq(
    betSeedData.feeBalance.mul(iterationNumber),
  );
  expect(await that.ownerPetoBetContract.getBalance()).eq(betSeedData.deposit12);
}
