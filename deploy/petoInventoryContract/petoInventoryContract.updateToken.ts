import { callWithTimerHre, waitTx } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployData } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} starts token updating...`);

    const users = await getUsers();
    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      users,
      petoInventoryAddress,
    );

    await waitTx(ownerPetoInventoryContract.updateToken(deployData.tokenId, true), `updateToken`);
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:update-token`];

export default func;
