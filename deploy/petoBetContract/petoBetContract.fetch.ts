import { callWithTimerHre, printBigNumber } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts fetching...`);

    const users = await getUsers();
    const { user1, user2 } = users;
    const { ownerPetoBetContract } = await getPetoBetContext(users, petoBetAddress);

    const user1Balance = await ownerPetoBetContract.balanceOf(user1.address);
    console.log(
      `user1 free:${printBigNumber(user1Balance.free)}, locked:${printBigNumber(
        user1Balance.locked,
      )}`,
    );
    const user2Balance = await ownerPetoBetContract.balanceOf(user2.address);
    console.log(
      `user1 free:${printBigNumber(user2Balance.free)}, locked:${printBigNumber(
        user2Balance.locked,
      )}`,
    );
    const feeBalance = await ownerPetoBetContract.getFeeBalance();
    console.log(`fee balance:${printBigNumber(feeBalance)}`);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:fetch`];

export default func;
