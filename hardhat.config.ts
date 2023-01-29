import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

// Ensure that we have all the environment variables we need.
const providerUrl: string | undefined = process.env.PROVIDER_URL;
if (!providerUrl) {
  throw new Error("Please set your PROVIDER_URL in a .env file");
}

const adminPrivateKey = `0x${process.env.ADMIN_PRIVATE_KEY}`;
if (adminPrivateKey.length < 3) {
  throw new Error("Please set your ADMIN_PRIVATE_KEY in a .env file");
}
const userPrivateKey = `0x${process.env.USER_PRIVATE_KEY}`;
if (userPrivateKey.length < 3) {
  throw new Error("Please set your USER_PRIVATE_KEY in a .env file");
}

function getChainConfig(): NetworkUserConfig {
  return {
    url: providerUrl,
    accounts: [adminPrivateKey, userPrivateKey],
  };
}

const config: HardhatUserConfig = {
  // defaultNetwork: "mumbai",
  defaultNetwork: "polygon",
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    polygon: getChainConfig(),
    mumbai: getChainConfig(),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.17",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    // outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
