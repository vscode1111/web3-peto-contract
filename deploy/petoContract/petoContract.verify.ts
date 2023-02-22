import { CONTRACTS, CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployNetworks } from "types/common";
import { callWithTimer, verifyContract } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;
    console.log(`${CONTRACT_NAME} ${contractAddress} is verify...`);
    await verifyContract(contractAddress, hre);
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:verify`];

export default func;
