import { JsonMetadata } from "@common";

export const deployData = {
  name: "Name_b02",
  symbol: "Symbol_b02",
  tokenCount: 20,
  tokenId: 6,
  userAddress: "0xECA894f3480364a6339692c5a9e7339109805a2C",
};

export const jsonDictionary: Record<string | number, JsonMetadata> = {
  contract: {
    name: `test contract`,
    banner: "https://test_contract_banner",
    image: "https://test_image_banner",
    description: `contract description`,
  },
  //Collections
  0: {
    name: "collection 0",
    image: "https://collection_01.png",
    description: `collection 0 description`,
  },
  1: {
    name: "collection 1",
    image: "https://collection_1.png",
    description: `collection 1 description`,
  },
  2: {
    name: "collection 2",
    image: "https://collection_2.png",
    description: `collection 2 description`,
  },
};
