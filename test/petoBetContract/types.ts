import { Fixture } from "test/types";
import { PetoBetContract } from "typechain-types/contracts/PetoBetContract";
import { Users } from "types";

export interface PetoBetContextBase extends Users {
  ownerPetoBetContract: PetoBetContract;
  user1PetoBetContract: PetoBetContract;
  user2PetoBetContract: PetoBetContract;
}

declare module "mocha" {
  export interface Context extends PetoBetContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}
