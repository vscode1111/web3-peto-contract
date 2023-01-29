import { expect } from "chai";
import { StringNumber } from "types/common";

export function getCollectionName(name: StringNumber) {
  return `collection ${name}`;
}

export async function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
  let error: any = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an("Error");
  if (errorMessage) {
    expect(error?.message).to.equal(errorMessage);
  }
}

export function vmEsceptionText(text: string) {
  return `VM Exception while processing transaction: reverted with reason string '${text}'`;
}
