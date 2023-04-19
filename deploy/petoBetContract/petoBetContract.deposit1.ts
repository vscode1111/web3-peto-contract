import { callWithTimerHre, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { betSeedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts depositing by user1...`);

    const { user1PetoBetContract } = await getPetoBetContext(await getUsers(), petoBetAddress);

    await waitTx(
      user1PetoBetContract.deposit({
        value: betSeedData.deposit1,
      }),
      `deposit1`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:deposit1`];

export default func;
