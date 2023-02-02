import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

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

    console.log(`PetoContract ${contractAddress} is initiating...`);

    const [admin] = await hre.ethers.getSigners();

    const petoContractFactory = <PetoContract__factory>(
      await ethers.getContractFactory("PetoContract")
    );

    const adminPetoContract = <PetoContract>(
      await petoContractFactory.connect(admin).attach(contractAddress)
    );

    console.log(`Setting init values...`);
    await (await adminPetoContract.safeMint(admin.address)).wait();
    await (await adminPetoContract.setURI(`${HOST_URL}/${deployValue.nftPostfix}/`)).wait();
    if (INIT_COLLECTION) {
      await (await adminPetoContract.createTokens(deployValue.tokenCount)).wait();
    }
    console.log(`Init values were set`);
  }, hre);
};

func.tags = ["PetoContract:init"];

export default func;
