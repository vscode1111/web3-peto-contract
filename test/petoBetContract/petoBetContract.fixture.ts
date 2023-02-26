import { getPetoBetContext, getUsers } from "utils";

import { PetoBetContextBase } from "./types";

export async function deployPetoContractFixture(): Promise<PetoBetContextBase> {
  const users = await getUsers();

  const { ownerPetoBetContract, user1PetoBetContract, user2PetoBetContract } =
    await getPetoBetContext(users);

  await ownerPetoBetContract.deployed();

  return {
    ...users,
    ownerPetoBetContract,
    user1PetoBetContract,
    user2PetoBetContract,
  };
}
