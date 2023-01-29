import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      // ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks];

    console.log(`PetoContract [${contractAddress}] is initiating...`);

    // const [admin] = await hre.ethers.getSigners();

    // const PetoContractFactory = <PetoContract__factory>(
    //   await ethers.getContractFactory("PetoContract")
    // );

    // console.log(`Setting init values...`);
    // let tx = await adminPetoContract.setName(`Peto_test_${deployValue.nftPostfix}`);
    // await tx.wait();
    // console.log(`Init values were set`);
  }, hre);
};

func.tags = ["PetoContract:init"];

export default func;
