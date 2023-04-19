import { callWithTimerHre } from "@common";
import { PETO_BET_CONTRACT_NAME } from "@constants";
import { betSeedData } from "@seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers, signMessageForTransferEx } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts fetching signature...`);

    const petoBetContext = await getPetoBetContext(await getUsers(), petoBetAddress);
    const { user1, user2 } = petoBetContext;

    const signature = await signMessageForTransferEx(petoBetContext, betSeedData.gameIdForce);

    console.table({
      from: user1.address,
      to: user2.address,
      gameId: betSeedData.gameIdForce,
      feeRate: betSeedData.feeRate.toString(),
      signature,
    });
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:signature`];

export default func;
