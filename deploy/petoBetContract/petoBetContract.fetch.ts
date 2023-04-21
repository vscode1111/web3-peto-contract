import { callWithTimerHre } from "@common";
import { PETO_BET_CONTRACT_NAME } from "@constants";
import { getAddressesFromHre, getPetoBetContext, getUsers } from "@utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { printFeeBalance, printUserBalance } from "./utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(`${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts fetching...`);

    const users = await getUsers();
    const { user1, user2 } = users;
    const { ownerPetoBetContract } = await getPetoBetContext(users, petoBetAddress);

    const user1Balance = await ownerPetoBetContract.balanceOf(user1.address);
    printUserBalance(user1Balance, "user1");
    const user2Balance = await ownerPetoBetContract.balanceOf(user2.address);
    printUserBalance(user2Balance, "user2");
    const feeBalance = await ownerPetoBetContract.getFeeBalance();
    printFeeBalance(feeBalance);
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:fetch`];

export default func;
