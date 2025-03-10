import { callWithTimerHre, waitTx } from "@common";
import { PETO_BET_CONTRACT_NAME } from "@constants";
import { betSeedData } from "@seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts depositing by user2...`);

    const { user2PetoBetContract } = await getPetoBetContext(await getUsers(), petoBetAddress);

    await waitTx(
      user2PetoBetContract.deposit({
        value: betSeedData.deposit2,
      }),
      `deposit1`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:deposit2`];

export default func;
