import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export interface DeployNetworks {
  polygon: string;
  opera: string;
  bsc: string;
}

export interface Addresses {
  petoBetAddress: string;
  petoInventoryAddress: string;
}

export interface Users {
  owner: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  user3: SignerWithAddress;
}
