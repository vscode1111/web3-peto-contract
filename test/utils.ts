import { PetoInventoryContract } from "typechain-types/contracts/PetoInventoryContract";
import { StringNumber } from "types";

import { testData } from "./petoInventoryContract/testData";

export function getCollectionName(name: StringNumber) {
  return `collection ${name}`;
}

export async function initCollectionsReal(
  petoInventoryContract: PetoInventoryContract,
  tokenCount = testData.tokenCount,
) {
  await petoInventoryContract.setURI(testData.uri);
  await petoInventoryContract.createTokens(tokenCount);
}
