import { DeployNetworks } from "types";

export const PETO_BET_CONTRACT_NAME = "PetoBetContract";
export const PETO_INVENTORY_CONTRACT_NAME = "PetoInventoryContract";

export enum CONTRACT_LIST {
  PETO_BET = "PETO_BET",
  PETO_INVENTORY = "PETO_INVENTORY",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  PETO_BET: {
    opera: "0xd4971E5a6F0f7c3120136E2fD2f4bc251BfC83A6",
    bsc: "",
    polygon: "0x7988361Fa39b49C619716C96F93665DC326f24CD", //test
  },
  PETO_INVENTORY: {
    opera: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
    // bsc: "0xee40faed7aA646113c0492dA0EfC5AfA84b2B81C", //1
    bsc: "0xF199014F70C5e0354023A9E79dEBdB8Ffb2854a8", //1
    // bsc: "0xE9894AF13eEF1e761d4a7Af759609c2897103936", //2
    // polygon: "0x1AC18c75fFBCcc172F7417730E1a706c0c00524f", //b1
    // polygon: "0xB48a9D74014FD2af4D75E438c025169a08d4aF29", //b2
    polygon: "0xc243AC09Cc8299f216d1D56c3021A17D03821389", //test
  },
};
