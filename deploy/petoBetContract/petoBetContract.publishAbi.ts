import { callWithTimerHre } from "@common";
import { PETO_BET_CONTRACT_NAME } from "@constants";
import appRoot from "app-root-path";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const root = appRoot.toString();

    const sourcePath = `${root}/artifacts/contracts/PetoBetContract.sol/PetoBetContract.json`;

    const file = fs.readFileSync(sourcePath, { encoding: "utf8", flag: "r" });
    const jsonFile = JSON.parse(file);

    const abi = jsonFile.abi;

    const targetPath = `${root}/../web3bet/src/contracts/abi/PetoBetContract.json`;
    fs.writeFileSync(targetPath, JSON.stringify(abi, null, 2));

    console.log(`ABI-file was saved to ${targetPath}`);
  });
};

func.tags = [`${PETO_BET_CONTRACT_NAME}:publish-abi`];

export default func;
