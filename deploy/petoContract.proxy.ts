import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    console.log("PetoContract proxy is deploying...");
    const { ethers } = hre;
    const petoContractFactory = <PetoContract__factory>(
      await ethers.getContractFactory("PetoContract")
    );
    const petoContract = <PetoContract>await upgrades.deployProxy(
      petoContractFactory,
      [deployValue.name, deployValue.symbol],
      // [],
      {
        initializer: "initialize",
        kind: "uups",
      },
    );
    await petoContract.deployed();
    console.log(`PetoContract deployed to ${petoContract.address}`);
  }, hre);
};

func.tags = ["PetoContract:proxy"];

export default func;
