import { callWithTimerHre } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { smokeTest } from "test/petoBetContract/petoBetContract.behavior.smoke-test";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} run smoke test...`);

    const context = await getPetoBetContext(await getUsers(), petoBetAddress);

    await smokeTest(context);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:smoke-test`];

export default func;
