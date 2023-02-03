import { ethers, upgrades } from "hardhat";
import { testValue } from "test/testData";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";

import { ContextBase } from "../types";

export async function deployPetoContractFixture(): Promise<ContextBase> {
  const [user1, user2, shop] = await ethers.getSigners();

  const PetoContractFactory = <PetoContract__factory>(
    await ethers.getContractFactory("PetoContract")
  );
  const adminPetoContract = <PetoContract>(
    await upgrades.deployProxy(PetoContractFactory, [testValue.name, testValue.symbol])
  );
  await adminPetoContract.deployed();

  const user1PetoContract = await adminPetoContract.connect(user1);
  const user2PetoContract = await adminPetoContract.connect(user2);
  const shopPetoContract = await adminPetoContract.connect(shop);

  return {
    adminPetoContract,
    user1PetoContract,
    user2PetoContract,
    shopPetoContract,
  };
}
