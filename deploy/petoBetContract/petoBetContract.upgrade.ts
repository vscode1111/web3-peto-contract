import { callWithTimerHre, verifyContract } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} is upgrading...`);

    const { petoBetFactory } = await getPetoBetContext(await getUsers(), petoBetAddress);

    await upgrades.upgradeProxy(petoBetAddress, petoBetFactory);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} was upgraded`);
    await verifyContract(petoBetAddress, hre);
    console.log(`${petoBetAddress} upgraded and verified to ${petoBetAddress}`);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:upgrade`];

export default func;
