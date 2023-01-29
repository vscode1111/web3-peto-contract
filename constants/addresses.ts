import { DeployNetworks } from "types/common";

export enum CONTRACT_LIST {
  PETO = "PETO",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  PETO: {
    mumbai: "",
    polygon: "0xc366d2b21Dd5B6c72aDB18450AaA352744584b00",
  },
};
