import { callWithTimerHre, waitForTx } from "common";
import { PETO_INVENTORY_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "utils";

import { deployData } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} starts transfering...`);

    const users = await getUsers();
    const { owner } = users;
    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      users,
      petoInventoryAddress,
    );

    await waitForTx(
      ownerPetoInventoryContract["safeTransferFrom(address,address,uint256)"](
        owner.address,
        deployData.userAddress,
        deployData.tokenId,
      ),
      `safeTransferFrom`,
    );
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:transfer`];

export default func;
