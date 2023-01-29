import { expect } from "chai";
import { testValue } from "test/testData";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return correct name and symbol", async function () {
      expect(await this.adminPetoContract.name()).to.equal(testValue.name);
      expect(await this.adminPetoContract.symbol()).to.equal(testValue.symbol);
    });
  });
}
