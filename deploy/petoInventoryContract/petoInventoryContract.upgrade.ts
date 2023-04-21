import { callWithTimerHre, verifyContract } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "@utils";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verifyRequired } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} is upgrading...`);

    const { petoInventoryFactory } = await getPetoInventoryContext(
      await getUsers(),
      petoInventoryAddress,
    );

    await upgrades.upgradeProxy(petoInventoryAddress, petoInventoryFactory);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} was upgraded`);

    if (verifyRequired) {
      await verifyContract(petoInventoryAddress, hre);
      console.log(`${petoInventoryAddress} upgraded and verified to ${petoInventoryAddress}`);
    }
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:upgrade`];

export default func;
