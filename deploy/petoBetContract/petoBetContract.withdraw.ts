import { callWithTimerHre, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts withdrawing...`);

    const { user1PetoBetContract } = await getPetoBetContext(await getUsers(), petoBetAddress);

    await waitTx(user1PetoBetContract.withdraw(seedData.deposit1), `withdraw`);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:withdraw1`];

export default func;
