// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";

contract PetoInventoryContract is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using StringsUpgradeable for uint256;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name_, string memory symbol_) public initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //Variables, structs, modifiers, events------------------------

    CountersUpgradeable.Counter private _tokenIdCounter;

    mapping(uint32 => TokenItem) private _tokenItems;

    string private _uri;

    struct TokenItem {
        uint32 tokenId;
        address owner;
        bool transferable;
        bool transfered;
    }

    modifier onlyExists(uint32 tokenId) {
        TokenItem memory token = fetchToken(tokenId);
        require(token.owner != address(0), "This token was burnt");
        _;
    }

    modifier onlyTransferableToken(uint32 tokenId) {
        TokenItem memory token = fetchToken(tokenId);
        require(token.transferable, "Token must be transferable");
        _;
    }

    //Functions-------------------------------------------

    function mint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        createItem(uint32(tokenId), to);
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function burn(uint32 tokenId) public onlyOwner onlyExists(tokenId) {
        _transferToken(uint32(tokenId), address(0));
        _burn(tokenId);
    }

    function mintBatch(address[] calldata addresses) public onlyOwner {
        for (uint32 i = 0; i < addresses.length; i++) {
            mint(addresses[i]);
        }
    }

    function createItem(uint32 tokenId, address owner_) private onlyOwner {
        _tokenItems[tokenId] = TokenItem(tokenId, owner_, true, false);
    }

    function createTokens(uint32 tokenCount) external onlyOwner {
        for (uint32 i = 0; i < tokenCount; i++) {
            mint(_msgSender());
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

    function fetchToken(uint32 tokenId) public view returns (TokenItem memory) {
        return _tokenItems[tokenId];
    }

    function getTokenCount() public view returns (uint32) {
        return uint32(_tokenIdCounter.current());
    }

    function _transferToken(uint32 tokenId, address to) private returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[tokenId];
        token.owner = to;
        token.transfered = true;
        return token;
    }

    // function safeTransferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public virtual override onlyTransferableToken(uint32(tokenId)) {
    //     console.log(111, "safeTransferFrom");
    //     super.safeTransferFrom(from, to, tokenId);
    // }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override onlyTransferableToken(uint32(tokenId)) onlyExists(uint32(tokenId)) {
        _transferToken(uint32(tokenId), to);
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function setURI(string memory uri) external onlyOwner {
        _uri = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string.concat(_uri, tokenId.toString(), ".json");
    }

    function contractURI() public view returns (string memory) {
        return string.concat(_uri, "contract.json");
    }

    function updateToken(
        uint32 tokenId,
        bool transferable
    ) external onlyOwner returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[tokenId];
        token.transferable = transferable;
        return token;
    }
}
