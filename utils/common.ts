import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { signMessage } from "common";
import { BigNumber } from "ethers";
import { seedData } from "seeds";
import { PetoBetContextBase } from "test";

export async function signMessageForTransfer(
  signer: SignerWithAddress,
  from: string,
  to: string,
  gameId: string,
  feeRate: BigNumber,
) {
  return signMessage(
    signer,
    ["address", "address", "string", "uint256"],
    [from, to, gameId, feeRate],
  );
}

export async function signMessageForTransferEx(that: PetoBetContextBase, gameId?: string) {
  return signMessageForTransfer(
    that.owner,
    that.user1.address,
    that.user2.address,
    gameId ?? seedData.gameId0,
    seedData.feeRate,
  );
}
