import { Fixture } from "@test";
import { PetoInventoryContract } from "@typechain-types/contracts/PetoInventoryContract";
import { Users } from "@types";

export interface PetoInventoryContextBase extends Users {
  ownerPetoInventoryContract: PetoInventoryContract;
  user1PetoInventoryContract: PetoInventoryContract;
  user2PetoInventoryContract: PetoInventoryContract;
  shopPetoInventoryContract: PetoInventoryContract;
}

declare module "mocha" {
  export interface Context extends PetoInventoryContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}
