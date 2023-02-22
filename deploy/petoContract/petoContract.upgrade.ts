import { CONTRACTS, CONTRACT_NAME } from "constants/addresses";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer, verifyContract } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;

    console.log(`${CONTRACT_NAME} ${contractAddress} is upgrading...`);

    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(CONTRACT_NAME);
    await upgrades.upgradeProxy(contractAddress, contractFactory);
    await verifyContract(contractAddress, hre);
    console.log(`${contractAddress} upgraded and verified to ${contractAddress}`);
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:upgrade`];

export default func;
