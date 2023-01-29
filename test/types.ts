import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";
import { PetoContract } from "typechain-types/contracts/PetoContract";

type Fixture<T> = () => Promise<T>;

export interface ContextBase {
  adminPetoContract: PetoContract;
  user1PetoContract: PetoContract;
  user2PetoContract: PetoContract;
  shopPetoContract: PetoContract;
}

declare module "mocha" {
  export interface Context extends ContextBase {
    admin: SignerWithAddress;
    user1: SignerWithAddress;
    user2: SignerWithAddress;
    shop: SignerWithAddress;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
}

export interface ICollectionItem {
  name: string;
  tokenCount: number;
  price: BigNumber;
  expiryDate: number;
}
