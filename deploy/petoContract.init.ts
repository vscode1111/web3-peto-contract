import { CONTRACTS, contractName } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer, waitForTx } from "utils/common";

import { deployValue } from "./deployData";

const HOST_URL = "https://carbar.online/nft_json";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;

    console.log(`${contractName} ${contractAddress} is initiating...`);

    const [admin] = await hre.ethers.getSigners();

    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(contractName);

    const adminContract = <PetoContract>(
      await contractFactory.connect(admin).attach(contractAddress)
    );

    console.log(`Setting init values...`);
    await waitForTx(adminContract.setURI(`${HOST_URL}/${deployValue.nftPostfix}/`), "setURI");

    if (INIT_COLLECTION) {
      await waitForTx(
        adminContract.createTokens(deployValue.tokenCount),
        `createTokens (${deployValue.tokenCount})`,
      );
    }
    console.log(`Init values were set`);
  }, hre);
};

func.tags = [`${contractName}:init`];

export default func;
