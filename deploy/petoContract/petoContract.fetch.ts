import { CONTRACTS, CONTRACT_NAME } from "constants/addresses";
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
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;

    console.log(`${CONTRACT_NAME} ${contractAddress} is fetching...`);

    const [admin] = await hre.ethers.getSigners();

    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(CONTRACT_NAME);

    const adminContract = <PetoContract>(
      await contractFactory.connect(admin).attach(contractAddress)
    );

    const url = await adminContract.tokenURI(0);
    console.log(url);
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:fetch`];

export default func;
