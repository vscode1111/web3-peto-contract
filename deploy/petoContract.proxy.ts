import { contractName } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { callWithTimer, verifyContract } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    console.log(`${contractName} proxy is deploying...`);
    const { ethers } = hre;
    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(contractName);
    const contract = <PetoContract>(
      await upgrades.deployProxy(contractFactory, [deployValue.name, deployValue.symbol])
    );
    await contract.deployed();
    console.log(`${contractName} deployed to ${contract.address}`);
    await verifyContract(contract.address, hre);
    console.log(`${contractName} deployed and verified to ${contract.address}`);
  }, hre);
};

func.tags = [`${contractName}:proxy`];

export default func;
