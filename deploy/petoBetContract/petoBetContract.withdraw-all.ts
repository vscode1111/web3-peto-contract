import { callWithTimerHre, waitForTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts withdrawing...`);

    const users = await getUsers();
    const { owner } = users;
    const { ownerPetoBetContract, user1PetoBetContract, user2PetoBetContract } =
      await getPetoBetContext(users, petoBetAddress);

    await waitForTx(user1PetoBetContract.withdraw(seedData.remains1), `withdraw`);
    await waitForTx(user2PetoBetContract.withdraw(seedData.deposit2Win), `withdraw`);
    await waitForTx(
      ownerPetoBetContract.withdrawFee(owner.address, seedData.feeBalance),
      `withdrawFee`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:withdraw-all`];

export default func;
