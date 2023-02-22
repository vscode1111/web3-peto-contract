import { CONTRACT_NAME } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { callWithTimer, verifyContract } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    console.log(`${CONTRACT_NAME} proxy is deploying...`);
    const { ethers } = hre;
    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(CONTRACT_NAME);
    const contract = <PetoContract>(
      await upgrades.deployProxy(contractFactory, [deployValue.name, deployValue.symbol])
    );
    await contract.deployed();
    console.log(`${CONTRACT_NAME} deployed to ${contract.address}`);
    await verifyContract(contract.address, hre);
    console.log(`${CONTRACT_NAME} deployed and verified to ${contract.address}`);
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:proxy`];

export default func;
