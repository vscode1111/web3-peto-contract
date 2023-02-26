import { deployData } from "deploy/petoInventoryContract/deployData";
import { getPetoInventoryContext, getUsers } from "utils";

import { PetoInventoryContextBase } from "./types";

export async function deployPetoContractFixture(): Promise<PetoInventoryContextBase> {
  const users = await getUsers();

  const { ownerPetoInventoryContract, user1PetoInventoryContract, user2PetoInventoryContract } =
    await getPetoInventoryContext(users, {
      name: deployData.name,
      symbol: deployData.symbol,
    });

  await ownerPetoInventoryContract.deployed();

  return {
    ...users,
    ownerPetoInventoryContract,
    user1PetoInventoryContract,
    user2PetoInventoryContract,
  };
}
