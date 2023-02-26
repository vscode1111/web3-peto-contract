import { callWithTimerHre, verifyContract } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${PETO_BET_CONTRACT_NAME} proxy is deploying...`);

    const { ownerPetoBetContract } = await getPetoBetContext(await getUsers());

    await ownerPetoBetContract.deployed();
    console.log(`${PETO_BET_CONTRACT_NAME} deployed to ${ownerPetoBetContract.address}`);
    await verifyContract(ownerPetoBetContract.address, hre);
    console.log(
      `${PETO_BET_CONTRACT_NAME} deployed and verified to ${ownerPetoBetContract.address}`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:proxy`];

export default func;
