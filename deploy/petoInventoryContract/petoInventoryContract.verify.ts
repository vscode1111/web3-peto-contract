import { callWithTimerHre, verifyContract } from "common";
import { PETO_INVENTORY_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} is verify...`);
    await verifyContract(petoInventoryAddress, hre);
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:verify`];

export default func;
