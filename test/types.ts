import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export type Fixture<T> = () => Promise<T>;

export interface Signers {
  admin: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
}
