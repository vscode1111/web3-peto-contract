import { getNetworkName } from "@common";
import { CONTRACTS, PETO_BET_CONTRACT_NAME, PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { PetoBetContextBase } from "@test/petoBetContract/types";
import { PetoBetContract } from "@typechain-types/contracts/PetoBetContract";
import { PetoInventoryContract } from "@typechain-types/contracts/PetoInventoryContract";
import { PetoBetContract__factory } from "@typechain-types/factories/contracts/PetoBetContract__factory";
import { PetoInventoryContract__factory } from "@typechain-types/factories/contracts/PetoInventoryContract__factory";
import { Addresses, DeployNetworks, Users } from "@types";
import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const OPTIONS: DeployProxyOptions = {
  initializer: "initialize",
  kind: "uups",
};

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const petoBetAddress = CONTRACTS.PetoBet[network];
  const petoInventoryAddress = CONTRACTS.PetoInventory[network];
  return {
    petoBetAddress,
    petoInventoryAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}

export async function getUsers(): Promise<Users> {
  const [owner, user1, user2, user3] = await ethers.getSigners();
  return {
    owner,
    user1,
    user2,
    user3,
  };
}

export async function getPetoBetContext(
  users: Users,
  createObj?: string,
  ownerForce?: SignerWithAddress,
): Promise<PetoBetContextBase> {
  const { owner, user1, user2 } = users;

  const petoBetFactory = <PetoBetContract__factory>(
    (await ethers.getContractFactory(PETO_BET_CONTRACT_NAME)).connect(ownerForce ?? owner)
  );

  let ownerPetoBetContract: PetoBetContract;

  if (typeof createObj === "string") {
    const contractAddress = createObj as string;
    ownerPetoBetContract = <PetoBetContract>petoBetFactory.attach(contractAddress);
  } else {
    ownerPetoBetContract = <PetoBetContract>await upgrades.deployProxy(petoBetFactory, [], OPTIONS);
  }

  const user1PetoBetContract = ownerPetoBetContract.connect(user1);
  const user2PetoBetContract = ownerPetoBetContract.connect(user2);

  return {
    ...users,
    petoBetFactory,
    ownerPetoBetContract,
    user1PetoBetContract,
    user2PetoBetContract,
  };
}

export async function getPetoInventoryContext(
  users: Users,
  createObj: string | { name: string; symbol: string },
  ownerForce?: SignerWithAddress,
) {
  const { owner, user1, user2 } = users;

  const petoInventoryFactory = <PetoInventoryContract__factory>(
    (await ethers.getContractFactory(PETO_INVENTORY_CONTRACT_NAME)).connect(ownerForce ?? owner)
  );

  let ownerPetoInventoryContract: PetoInventoryContract;

  if (typeof createObj === "string") {
    const contractAddress = createObj as string;
    ownerPetoInventoryContract = <PetoInventoryContract>(
      petoInventoryFactory.attach(contractAddress)
    );
  } else {
    ownerPetoInventoryContract = <PetoInventoryContract>(
      await upgrades.deployProxy(
        petoInventoryFactory,
        [createObj!.name, createObj!.symbol],
        OPTIONS,
      )
    );
  }

  const user1PetoInventoryContract = ownerPetoInventoryContract.connect(user1);
  const user2PetoInventoryContract = ownerPetoInventoryContract.connect(user2);

  return {
    petoInventoryFactory,
    ownerPetoInventoryContract,
    user1PetoInventoryContract,
    user2PetoInventoryContract,
  };
}
