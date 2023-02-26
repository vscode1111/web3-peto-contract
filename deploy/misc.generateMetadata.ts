import appRoot from "app-root-path";
import { callWithTimerHre } from "common";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

interface IMetadata {
  name: string;
  image: string;
  banner?: string;
  description: string;
}

const CONTRACT_NAME = `erc721_test_0`;

const DICTIONARY: Record<string | number, IMetadata> = {
  0: {
    name: "Token 0",
    image:
      "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: `Token 0 test description. ${CONTRACT_NAME}`,
  },
  1: {
    name: "Token 1",
    image:
      "https://images.pexels.com/photos/844125/pexels-photo-844125.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: `Token 1 test description. ${CONTRACT_NAME}`,
  },
  2: {
    name: "Token 2",
    image:
      "https://images.pexels.com/photos/844127/pexels-photo-844127.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: `Token 2 test description. ${CONTRACT_NAME}`,
  },
  3: {
    name: "Token 3",
    image:
      "https://images.pexels.com/photos/843700/pexels-photo-843700.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: `Token 3 test description. ${CONTRACT_NAME}`,
  },
  4: {
    name: "Token 4",
    image:
      "https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: `Token 3 test description. ${CONTRACT_NAME}`,
  },
};

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const dir = `${appRoot.toString()}/nft/}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    Object.entries(DICTIONARY).forEach(([key, value]) => {
      fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(value, null, 2));
    });
  });
};

func.tags = ["misc:generate-metadata"];

export default func;
