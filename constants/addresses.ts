import { DeployNetworks } from "types/common";

export const CONTRACT_NAME = "PetoContract";

export enum CONTRACT_LIST {
  PETO = "PETO",
}

export const CONTRACTS: Record<CONTRACT_LIST, Partial<DeployNetworks>> = {
  PETO: {
    opera: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
    //bsc: "0xee40faed7aA646113c0492dA0EfC5AfA84b2B81C",
    bsc: "0xE9894AF13eEF1e761d4a7Af759609c2897103936",
    // polygon: "0x1AC18c75fFBCcc172F7417730E1a706c0c00524f", //b1
    polygon: "0xB48a9D74014FD2af4D75E438c025169a08d4aF29", //b2
  },
};
