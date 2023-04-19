import { callWithTimerHre } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre, getPetoInventoryContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoInventoryAddress } = await getAddressesFromHre(hre);

    console.log(`${PETO_INVENTORY_CONTRACT_NAME} ${petoInventoryAddress} is fetching...`);

    const { ownerPetoInventoryContract } = await getPetoInventoryContext(
      await getUsers(),
      petoInventoryAddress,
    );

    console.log(await ownerPetoInventoryContract.tokenURI(0));
    console.log(await ownerPetoInventoryContract.contractURI());
  }, hre);
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:fetch`];

export default func;
