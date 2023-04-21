import { JsonMetadata } from "@common";

export const deployData = {
  name: "Name_b02",
  symbol: "Symbol_b02",
  tokenCount: 20,
  tokenId: 0,
  userAddress: "0xECA894f3480364a6339692c5a9e7339109805a2C",
};

export const jsonDictionary: Record<string | number, JsonMetadata> = {
  contract: {
    name: `test contract`,
    banner: "https://new-retail.ru/upload/iblock/1c5/1c5946036bf543783744bd315b6d8946.jpg",
    image:
      "https://images.ctfassets.net/6kz06gcm2189/27OknKy2oUNvX8rGm1fHXH/1c5dd162685656aae5cbd3a54c27102c/how-to-mint-an-nft.png",
    description: `contract description`,
  },
  //Tokens
  0: {
    name: "token 0",
    image: "https://root-nation.com/wp-content/uploads/2021/09/NFT-8.jpg",
    description: `token 0 description`,
  },
  1: {
    name: "token 1",
    image:
      "https://img.championat.com/c/1200x900/news/big/b/a/nft-portret-messi_16281638351598844024.jpg",
    description: `token 1 description`,
  },
  2: {
    name: "token 2",
    image: "https://dev.ua/storage/images/57/41/24/40/derived/e921d27dde16f0c305aaf0ae3d009cd8.jpg",
    description: `token 2 description`,
  },
};
