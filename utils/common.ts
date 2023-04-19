import { signMessage } from "common";
import { betSeedData } from "seeds";
import { PetoBetContextBase } from "test";

export async function signMessageForTransferEx(that: PetoBetContextBase, gameId?: string) {
  return signMessage(
    that.owner,
    //from,      to,        gameId,   feeRate
    ["address", "address", "string", "uint256"],
    [that.user1.address, that.user2.address, gameId ?? betSeedData.gameId0, betSeedData.feeRate],
  );
}
