import { DeployNetworks } from "@types";

export const PETO_BET_CONTRACT_NAME = "PetoBetContract";
export const PETO_INVENTORY_CONTRACT_NAME = "PetoInventoryContract";

export enum ContractList {
  PetoInventory = "PetoInventory",
  PetoBet = "PetoBet",
}

export const CONTRACTS: Record<ContractList, DeployNetworks> = {
  PetoInventory: {
    bsc: "0xF199014F70C5e0354023A9E79dEBdB8Ffb2854a8", //1
    // bsc: "0xE9894AF13eEF1e761d4a7Af759609c2897103936", //2
    // polygon: "0x1AC18c75fFBCcc172F7417730E1a706c0c00524f", //b1
    // polygon: "0xB48a9D74014FD2af4D75E438c025169a08d4aF29", //b2
    polygon: "0x1d14aD3A339845837F1A510746E98A81aE90Ea8F", //test
    okc: "",
    kcc: "",
  },
  PetoBet: {
    bsc: "0xEf23C1888779895dFA3BFf9105D057839888Df85",
    // polygon: "0x7988361Fa39b49C619716C96F93665DC326f24CD", //test
    // polygon: "0x52A997CED82769194f8977cF8e032976ab3DdB5C", //test-v2
    polygon: "0x5bE7dF24657E6DB20482f1dcD2777833460bE25B", //test-my
    okc: "0xfB2cA618f2BA9850524958719464F7E1444e315F",
    kcc: "0xc9829ca5b64c5394719370cb5d6ad44bfca8f0f8",
  },
};
