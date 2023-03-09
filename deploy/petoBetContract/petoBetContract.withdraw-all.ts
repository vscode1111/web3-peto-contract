import { callWithTimerHre, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "utils";

import { printFeeBalance, printUserBalance } from "./utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts withdrawing...`);

    const users = await getUsers();
    const { owner, user1, user2 } = users;
    const { ownerPetoBetContract, user1PetoBetContract, user2PetoBetContract } =
      await getPetoBetContext(users, petoBetAddress);

    const user1Balance = await ownerPetoBetContract.balanceOf(user1.address);
    printUserBalance(user1Balance);
    if (user1Balance.free.gt(0)) {
      await waitTx(user1PetoBetContract.withdraw(user1Balance.free), `withdraw`);
    }

    const user2Balance = await ownerPetoBetContract.balanceOf(user2.address);
    printUserBalance(user2Balance);
    if (user2Balance.free.gt(0)) {
      await waitTx(user2PetoBetContract.withdraw(user2Balance.free), `withdraw`);
    }

    const feeBalance = await ownerPetoBetContract.getFeeBalance();
    printFeeBalance(feeBalance);
    if (feeBalance.gt(0)) {
      await waitTx(ownerPetoBetContract.withdrawFee(owner.address, feeBalance), `withdrawFee`);
    }
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:withdraw-all`];

export default func;
