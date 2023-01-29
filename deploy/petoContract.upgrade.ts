import { CONTRACTS } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks];

    console.log(`PetoContract [${contractAddress}] is upgrading...`);

    const petoContractFactory = <PetoContract__factory>(
      await ethers.getContractFactory("PetoContract")
    );
    <PetoContract>await upgrades.upgradeProxy(contractAddress, petoContractFactory);
  }, hre);
};

func.tags = ["PetoContract:upgrade"];

export default func;
