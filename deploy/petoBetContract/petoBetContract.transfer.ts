import { callWithTimerHre, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { betSeedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts transfering...`);

    const users = await getUsers();
    const { user1, user2 } = users;
    const { ownerPetoBetContract } = await getPetoBetContext(users, petoBetAddress);

    await waitTx(
      ownerPetoBetContract.transfer(
        user1.address,
        user2.address,
        betSeedData.gameIdForce,
        betSeedData.feeRate,
      ),
      `transfer`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:transfer`];

export default func;
