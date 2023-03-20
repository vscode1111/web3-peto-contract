import { Fixture } from "test/types";
import { PetoBetContract } from "typechain-types/contracts/PetoBetContract";
import { PetoBetContract__factory } from "typechain-types/factories/contracts/PetoBetContract__factory";
import { Users } from "types";

export interface PetoBetContextBase extends Users {
  petoBetFactory: PetoBetContract__factory;
  ownerPetoBetContract: PetoBetContract;
  user1PetoBetContract: PetoBetContract;
  user2PetoBetContract: PetoBetContract;
}

declare module "mocha" {
  export interface Context extends PetoBetContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export enum EvenName {
  Deposit = "Deposit",
  PairLock = "PairLock",
  Transfer = "Transfer",
  Withdraw = "Withdraw",
  WithdrawFee = "WithdrawFee",
}
