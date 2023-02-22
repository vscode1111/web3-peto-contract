import { CONTRACTS, CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer, waitForTx } from "utils/common";

import { deployValue } from "../deployData";

//const HOST_URL = "https://petobots.io/nft/json/1/";
const HOST_URL = "https://petobots.io/nft/json/2/";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;

    console.log(`${CONTRACT_NAME} ${contractAddress} is initiating...`);

    const [admin] = await hre.ethers.getSigners();

    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(CONTRACT_NAME);

    const adminContract = <PetoContract>(
      await contractFactory.connect(admin).attach(contractAddress)
    );

    console.log(`Setting init values...`);
    // await waitForTx(adminContract.setURI(HOST_URL), "setURI");

    if (INIT_COLLECTION) {
      await waitForTx(
        adminContract.createTokens(deployValue.tokenCount),
        `createTokens (${deployValue.tokenCount})`,
      );
    }
    console.log(`Init values were set`);
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:init`];

export default func;
