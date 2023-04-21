import { callWithTimerHre, verifyContract } from "@common";
import { PETO_BET_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} is verify...`);
    await verifyContract(petoBetAddress, hre);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:verify`];

export default func;
