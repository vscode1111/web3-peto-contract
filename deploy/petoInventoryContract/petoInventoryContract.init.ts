import { callWithTimerHre, waitTx } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// const HOST_URL = "https://petobots.io/nft/json/1/";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} is initiating...`);

    const users = await getUsers();
    const { owner, user1, user2, user3 } = users;

    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      await getUsers(),
      petoInventoryAddress,
    );

    // await waitTx(ownerPetoInventoryContract.setURI(HOST_URL), "setURI");

    if (INIT_COLLECTION) {
      await waitTx(
        ownerPetoInventoryContract.mintBatch([
          owner.address,
          user1.address,
          user2.address,
          user3.address,
        ]),
        `mintBatch`,
      );
    }
    console.log(`Init values were set`);
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:init`];

export default func;
