import { callWithTimerHre, waitForTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts locking by user2...`);

    const users = await getUsers();
    const { user2 } = users;
    const { user2PetoBetContract } = await getPetoBetContext(users, petoBetAddress);

    await waitForTx(user2PetoBetContract.lock(user2.address, seedData.lock), `lock`);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:lock2`];

export default func;
