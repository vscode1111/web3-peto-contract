import { expect } from "chai";
import { BigNumber } from "ethers";
import _ from "lodash";
import { seedData } from "seeds";

import { PetoBetContextBase } from "./types";

interface BalanceObject {
  getBalance: () => Promise<BigNumber>;
}

export async function getTotalBalance(objects: BalanceObject[]): Promise<BigNumber> {
  const result = await Promise.all(objects.map((obj) => obj.getBalance()));
  return result.reduce((acc, cur) => acc.add(cur), seedData.zero);
}

export async function checkTotalBalance(that: PetoBetContextBase) {
  expect(
    await getTotalBalance([that.user1, that.user2, that.owner, that.ownerPetoBetContract]),
  ).closeTo(seedData.totalAccountBalance, seedData.error);
}
