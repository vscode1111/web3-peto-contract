import { DeployNetworks } from "types/common";

export const CONTRACT_NAME = "PetoContract";

export enum CONTRACT_LIST {
  PETO = "PETO",
}

export const CONTRACTS: Record<CONTRACT_LIST, Partial<DeployNetworks>> = {
  PETO: {
    opera: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
    bsc: "0x5321dD3EF9C9B13Ed7280737bf72D3279F49b2EF",
    // polygon: "0x1AC18c75fFBCcc172F7417730E1a706c0c00524f", //b1
    polygon: "0xB48a9D74014FD2af4D75E438c025169a08d4aF29", //b2
  },
};
