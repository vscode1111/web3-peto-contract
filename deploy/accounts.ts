import { FRACTION_DIGITS, toNumber } from "@common";
import { Signer } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  console.log("List of accounts:");
  const accounts: Signer[] = await hre.ethers.getSigners();

  let total = 0;

  const result = await Promise.all(
    accounts.map(async (account) => {
      const address = await account.getAddress();
      const balance = Number(toNumber(await account.getBalance()).toFixed(FRACTION_DIGITS));
      total += balance;
      return {
        address,
        balance,
      };
    }),
  );

  console.table(result);
  console.log(`total: ${total}`);
};

func.tags = ["accounts"];

export default func;
