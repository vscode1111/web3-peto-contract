import { CONTRACTS } from "constants/addresses";
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
    console.log(`PetoContract ${contractAddress} is verify...`);
    verifyContract(contractAddress, "../contracts/PetoContract.sol2", hre);
  }, hre);
};

func.tags = ["PetoContract:verify"];

export default func;
