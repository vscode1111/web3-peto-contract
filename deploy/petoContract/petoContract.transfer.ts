import { CONTRACTS, CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PetoContract } from "typechain-types/contracts/PetoContract";
import { PetoContract__factory } from "typechain-types/factories/contracts/PetoContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer, waitForTx } from "utils/common";

import { deployValue } from "../deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.PETO[name as keyof DeployNetworks] as string;

    console.log(`${CONTRACT_NAME} ${contractAddress} starts transfering...`);

    const [admin] = await hre.ethers.getSigners();

    const contractFactory = <PetoContract__factory>await ethers.getContractFactory(CONTRACT_NAME);

    const adminContract = <PetoContract>(
      await contractFactory.connect(admin).attach(contractAddress)
    );

    await waitForTx(
      adminContract["safeTransferFrom(address,address,uint256)"](
        admin.address,
        deployValue.userAddress,
        deployValue.tokenId,
      ),
      `safeTransferFrom`,
    );
  }, hre);
};

func.tags = [`${CONTRACT_NAME}:transfer`];

export default func;
