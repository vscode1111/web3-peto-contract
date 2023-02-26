import { callWithTimerHre, waitForTx } from "common";
import { PETO_INVENTORY_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "utils";

import { deployData } from "./deployData";

const HOST_URL = "https://petobots.io/nft/json/1/";
// const HOST_URL = "https://petobots.io/nft/json/2/";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} is initiating...`);

    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      await getUsers(),
      petoInventoryAddress,
    );

    await waitForTx(ownerPetoInventoryContract.setURI(HOST_URL), "setURI");

    if (INIT_COLLECTION) {
      await waitForTx(
        ownerPetoInventoryContract.createTokens(deployData.tokenCount),
        `createTokens (${deployData.tokenCount})`,
      );
    }
    console.log(`Init values were set`);
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:init`];

export default func;
