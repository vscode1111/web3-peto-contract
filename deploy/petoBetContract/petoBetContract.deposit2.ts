import { callWithTimerHre, waitForTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts depositing...`);

    const { user2PetoBetContract } = await getPetoBetContext(await getUsers(), petoBetAddress);

    await waitForTx(
      user2PetoBetContract.deposit({
        value: seedData.deposit2,
      }),
      `deposit1`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:deposit2`];

export default func;
