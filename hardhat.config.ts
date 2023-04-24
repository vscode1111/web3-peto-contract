import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { DeployNetworks } from "@types";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";

import { getEnv } from "./common/config";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

function getChainConfig(
  chain: keyof DeployNetworks,
  chainId?: number,
): NetworkUserConfig & { url?: string } {
  return {
    chainId,
    url: getEnv(`${chain.toUpperCase()}_PROVIDER_URL`),
    accounts: [
      `0x${getEnv("OWNER_PRIVATE_KEY")}`,
      `0x${getEnv("USER1_PRIVATE_KEY")}`,
      `0x${getEnv("USER2_PRIVATE_KEY")}`,
      `0x${getEnv("USER3_PRIVATE_KEY")}`,
      `0x${getEnv("SHOP_PRIVATE_KEY")}`,
    ],
  };
}

// export const defaultNetwork: keyof DeployNetworks = "polygon";
export const defaultNetwork: keyof DeployNetworks = "kcc";

const config: HardhatUserConfig = {
  defaultNetwork,
  etherscan: {
    apiKey: {
      polygon: getEnv("POLYGON_SCAN_API_KEY"),
      bsc: getEnv("BSC_SCAN_API_KEY"),
      okc: getEnv("OKC_SCAN_API_KEY"),
      kcc: getEnv("KCC_SCAN_API_KEY"),
    },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    polygon: getChainConfig("polygon"),
    bsc: getChainConfig("bsc"),
    okc: getChainConfig("okc", 66),
    kcc: getChainConfig("kcc", 321),
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
