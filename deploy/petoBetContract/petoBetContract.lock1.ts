import { callWithTimerHre, waitForTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts locking by user1...`);

    const users = await getUsers();
    const { user1 } = users;
    const { user1PetoBetContract } = await getPetoBetContext(users, petoBetAddress);

    await waitForTx(user1PetoBetContract.lock(user1.address, seedData.lock), `lock`);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:lock1`];

export default func;
