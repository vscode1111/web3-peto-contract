import { StringNumber } from "common";
import { PetoInventoryContract } from "typechain-types/contracts/PetoInventoryContract";

import { invTestData } from "./petoInventoryContract/testData";

export function getCollectionName(name: StringNumber) {
  return `collection ${name}`;
}

export async function initCollectionsReal(
  petoInventoryContract: PetoInventoryContract,
  tokenCount = invTestData.tokenCount,
) {
  await petoInventoryContract.setURI(invTestData.uri);
  await petoInventoryContract.createTokens(tokenCount);
}
