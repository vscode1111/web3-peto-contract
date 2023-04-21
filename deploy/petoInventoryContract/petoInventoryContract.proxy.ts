import { callWithTimerHre, verifyContract } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { getPetoInventoryContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployData } from "./deployData";

const IS_OWNER_DEPLOY = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} proxy is deploying...`);

    const users = await getUsers();
    const { owner, user1 } = users;

    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      users,
      {
        name: deployData.name,
        symbol: deployData.symbol,
      },
      IS_OWNER_DEPLOY ? owner : user1,
    );

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
