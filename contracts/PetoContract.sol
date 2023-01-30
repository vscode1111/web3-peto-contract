// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

contract PetoContract is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using StringsUpgradeable for uint256;

    CountersUpgradeable.Counter private _tokenIdCounter;

    mapping(uint32 => TokenItem) private _tokenItems;

    string private _uri;

    struct TokenItem {
        uint32 tokenId;
        address owner;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        CreateItem(uint32(tokenId), to);
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function CreateItem(uint32 tokenId, address owner) private onlyOwner {
        _tokenItems[tokenId] = TokenItem(tokenId, owner);
    }

    function createTokens(uint32 tokenCount) external onlyOwner {
        address owner = _msgSender();
        for (uint32 i = 0; i < tokenCount; i++) {
            safeMint(owner);
        }
    }

    function fetchTokens() external view returns (TokenItem[] memory) {
        uint32 tokenItemCount = uint32(_tokenIdCounter.current());
        TokenItem[] memory tokens = new TokenItem[](tokenItemCount);
        for (uint32 i = 0; i < tokenItemCount; i++) {
            tokens[i] = _tokenItems[i];
        }
        return tokens;
    }

    function setURI(string memory uri) external onlyOwner {
        _uri = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string.concat(_uri, tokenId.toString(), ".json");
    }
}
