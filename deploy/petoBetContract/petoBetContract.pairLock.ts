import { callWithTimerHre, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts locking...`);

    const users = await getUsers();
    const { user1, user2 } = users;
    const { ownerPetoBetContract } = await getPetoBetContext(users, petoBetAddress);
    console.log(`gameId: ${seedData.gameId0}`);

    await waitTx(
      ownerPetoBetContract.pairLock(user1.address, user2.address, seedData.gameId0, seedData.lock),
      `pairLock`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:pair-lock`];

export default func;
