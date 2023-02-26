import { callWithTimerHre, verifyContract } from "common";
import { PETO_INVENTORY_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getPetoInventoryContext, getUsers } from "utils";

import { deployData } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} proxy is deploying...`);

    const { ownerPetoInventoryContract } = await getPetoInventoryContext(await getUsers(), {
      name: deployData.name,
      symbol: deployData.symbol,
    });

    await ownerPetoInventoryContract.deployed();
    console.log(
      `${PETO_INVENTORY_CONTRACT_NAME} deployed to ${ownerPetoInventoryContract.address}`,
    );
    await verifyContract(ownerPetoInventoryContract.address, hre);
    console.log(
      `${PETO_INVENTORY_CONTRACT_NAME} deployed and verified to ${ownerPetoInventoryContract.address}`,
    );
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:proxy`];

export default func;
