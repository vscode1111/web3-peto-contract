import { DeployNetworks } from "types";

export const PETO_BET_CONTRACT_NAME = "PetoBetContract";
export const PETO_INVENTORY_CONTRACT_NAME = "PetoInventoryContract";

export enum ContractList {
  PetoInventory = "PetoInventory",
  PetoBet = "PetoBet",
}

export const CONTRACTS: Record<ContractList, DeployNetworks> = {
  PetoInventory: {
    opera: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
    // bsc: "0xee40faed7aA646113c0492dA0EfC5AfA84b2B81C", //1
    bsc: "0xF199014F70C5e0354023A9E79dEBdB8Ffb2854a8", //1
    // bsc: "0xE9894AF13eEF1e761d4a7Af759609c2897103936", //2
    // polygon: "0x1AC18c75fFBCcc172F7417730E1a706c0c00524f", //b1
    // polygon: "0xB48a9D74014FD2af4D75E438c025169a08d4aF29", //b2
    polygon: "0x991e4d8596c09A70Da8F72dF902e452142D84B79", //test
  },
  PetoBet: {
    opera: "0xd4971E5a6F0f7c3120136E2fD2f4bc251BfC83A6",
    bsc: "",
    // polygon: "0x7988361Fa39b49C619716C96F93665DC326f24CD", //test
    // polygon: "0x52A997CED82769194f8977cF8e032976ab3DdB5C", //test-v2
    polygon: "0x5bE7dF24657E6DB20482f1dcD2777833460bE25B", //test-my
  },
};
