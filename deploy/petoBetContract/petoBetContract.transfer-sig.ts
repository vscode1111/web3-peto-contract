import { callWithTimerHre, toNumber, waitTx } from "common";
import { PETO_BET_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { seedData } from "seeds";
import { getAddressesFromHre, getPetoBetContext, getUsers, signMessageForTransferEx } from "utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { petoBetAddress } = await getAddressesFromHre(hre);
    console.log(
      `${PETO_BET_CONTRACT_NAME} ${petoBetAddress} starts transfering using signature...`,
    );

    const users = await getUsers();
    const { user1, user2 } = users;
    const petoBetContext = await getPetoBetContext(users, petoBetAddress);
    const { user2PetoBetContract } = petoBetContext;

    const signature = await signMessageForTransferEx(petoBetContext, seedData.gameIdForce);
    // const signature = seedData.signatureForce;

    console.table({
      from: user1.address,
      to: user2.address,
      gameId: seedData.gameIdForce,
      feeRate: toNumber(seedData.feeRate),
      signature,
    });

    await waitTx(
      user2PetoBetContract.transferSig(
        user1.address,
        user2.address,
        seedData.gameIdForce,
        seedData.feeRate,
        signature,
      ),
      `transferSig`,
    );
  }, hre);
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:transfer-sig`];

export default func;
