import { getPetoBetContext, getUsers } from "@utils";

import { PetoBetContextBase } from "./types";

export async function deployPetoContractFixture(): Promise<PetoBetContextBase> {
  const users = await getUsers();

  const { ownerPetoBetContract, ...rest } = await getPetoBetContext(users);

  await ownerPetoBetContract.deployed();

  return {
    ...users,
    ownerPetoBetContract,
    ...rest,
  };
}
