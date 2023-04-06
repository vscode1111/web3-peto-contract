import { signMessage } from "common";
import { seedData } from "seeds";
import { PetoBetContextBase } from "test";

export async function signMessageForTransferEx(that: PetoBetContextBase, gameId?: string) {
  return signMessage(
    that.owner,
    //from,      to,        gameId,   feeRate
    ["address", "address", "string", "uint256"],
    [that.user1.address, that.user2.address, gameId ?? seedData.gameId0, seedData.feeRate],
  );
}
