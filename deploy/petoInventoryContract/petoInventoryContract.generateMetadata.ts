import { callWithTimerHre, checkFilePathSync } from "@common";
import { PETO_INVENTORY_CONTRACT_NAME } from "@constants";
import appRoot from "app-root-path";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

import { jsonDictionary } from "./deployData";

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const dir = `${appRoot.toString()}/nft`;
    checkFilePathSync(dir);
    Object.entries(jsonDictionary).forEach(([key, value]) => {
      fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(value, null, 2));
    });
  });
};

func.tags = [`${PETO_INVENTORY_CONTRACT_NAME}:generate-metadata`];

export default func;
