import { DeployNetworks } from "types/common";

export enum CONTRACT_LIST {
  PETO = "PETO",
}

export const CONTRACTS: Record<CONTRACT_LIST, Partial<DeployNetworks>> = {
  PETO: {
    opera: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
    bsc: "0x5321dD3EF9C9B13Ed7280737bf72D3279F49b2EF",
    // polygon: "0xc366d2b21Dd5B6c72aDB18450AaA352744584b00",
    // polygon: "0xe9D65D4392127d9b0Fe26C28da501d8a4f943fFB",
    // polygon: "0x992C523B8cB950a2226eD49B38c3bFa0De089f1a",
    // polygon: "0xd3C35c11b7C93ea48bEe8d066384B4b36d32ae35",
    polygon: "0x8e933cd23c6cB61Bd37033555223De1Aeec54bC2",
  },
};
