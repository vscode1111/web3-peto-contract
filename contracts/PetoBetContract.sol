// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./PayableContext.sol";
import "./SignatureBase.sol";

import "hardhat/console.sol";

contract PetoBetContract is
    PayableContext,
    SignatureBase,
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //Variables, structs, modifiers, events------------------------

    mapping(address => FundItem) private _balances;

    mapping(bytes32 => GameItem) private _gameIds;

    uint256 feeBalance;

    uint256 constant DECIMAL_FACTOR = 1e18;

    struct FundItem {
        uint256 free;
        uint256 locked;
    }

    struct GameItem {
        address account1;
        address account2;
        uint256 amount;
        bool transfered;
    }

    modifier onlySufficentFunds(address account, uint256 amount) {
        FundItem storage fund = _balances[account];
        require(fund.free >= amount, "Insufficent funds");
        _;
    }

    event Deposit(address indexed account, uint256 amount, uint32 timestamp);

    event Withdraw(address indexed account, uint256 amount, uint32 timestamp);

    event PairLock(
        address indexed account1,
        address indexed account2,
        bytes32 indexed gameIdHash,
        uint256 amount,
        uint32 timestamp
    );

    event Transfer(
        address indexed from,
        address indexed to,
        bytes32 indexed gameIdHash,
        uint256 amount,
        uint256 feeRate,
        uint32 timestamp
    );

    event WithdrawFee(address indexed account, uint256 amount, uint32 timestamp);

    //Functions-------------------------------------------

    function deposit() public payable nonReentrant {
        address sender = _msgSender();
        uint amount = _msgValue();
        FundItem storage fund = _balances[sender];
        fund.free += amount;
        emit Deposit(sender, amount, uint32(block.timestamp));
    }

    function withdraw(
        uint256 amount
    ) external onlySufficentFunds(_msgSender(), amount) nonReentrant {
        address sender = _msgSender();
        FundItem storage fund = _balances[sender];
        fund.free -= amount;
        (bool sent, ) = sender.call{ value: amount }("sent");
        require(sent, "Failed to complete");
        emit Withdraw(sender, amount, uint32(block.timestamp));
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getFeeBalance() external view returns (uint256) {
        return feeBalance;
    }

    function balanceOf(address account) external view returns (FundItem memory) {
        return _balances[account];
    }

    function lock(address account, uint256 amount) private onlySufficentFunds(account, amount) {
        FundItem storage fund = _balances[account];
        fund.free -= amount;
        fund.locked += amount;
    }

    function getGameIdHash(string memory gameId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(gameId));
    }

    function getGameItem(string memory gameId) public view returns (bytes32, GameItem memory) {
        bytes32 gameIdHash = getGameIdHash(gameId);
        return (gameIdHash, _gameIds[gameIdHash]);
    }

    function pairLock(
        address account1,
        address account2,
        string memory gameId,
        uint256 amount
    ) external onlyOwner {
        (bytes32 gameIdHash, GameItem memory gameItem) = getGameItem(gameId);
        require(
            gameItem.account1 == address(0) && gameItem.account2 == address(0),
            "This gameId was used before"
        );

        _gameIds[gameIdHash] = GameItem(account1, account2, amount, false);

        lock(account1, amount);
        lock(account2, amount);

        emit PairLock(account1, account2, gameIdHash, amount, uint32(block.timestamp));
    }

    function _transfer(address from, address to, string memory gameId, uint256 feeRate) internal {
        require(feeRate < 100 * DECIMAL_FACTOR, "feeRate must be less 100");

        (bytes32 gameIdHash, GameItem memory gameItem) = getGameItem(gameId);
        require(
            gameItem.account1 != address(0) && gameItem.account2 != address(0),
            "This gameId does not exist"
        );

        require(!gameItem.transfered, "This gameId was transfered before");

        require(
            from == gameItem.account1 || from == gameItem.account2,
            "FROM account wasn't verified by gameId"
        );

        require(
            to == gameItem.account1 || to == gameItem.account2,
            "TO account wasn't verified by gameId"
        );

        uint256 amount = gameItem.amount;

        FundItem storage fromFund = _balances[from];
        require(
            fromFund.locked >= amount,
            "Locked funds of FROM account must be equal to or greater than the amount"
        );

        FundItem storage toFund = _balances[to];
        require(
            toFund.locked >= amount,
            "Locked funds of TO account must be equal to or greater than the amount"
        );

        fromFund.locked -= amount;
        uint256 fee = (amount * feeRate) / DECIMAL_FACTOR / 100;
        uint256 win = amount - fee;
        feeBalance += fee;

        toFund.locked -= amount;
        toFund.free += amount + win;

        GameItem storage existGameItem = _gameIds[gameIdHash];
        existGameItem.transfered = true;

        emit Transfer(from, to, gameIdHash, amount, feeRate, uint32(block.timestamp));
    }

    function transfer(
        address from,
        address to,
        string memory gameId,
        uint256 feeRate
    ) external onlyOwner {
        _transfer(from, to, gameId, feeRate);
    }

    function transferSig(
        address from,
        address to,
        string memory gameId,
        uint256 feeRate,
        bytes memory signature
    ) external {
        bytes32 message = withPrefix(keccak256(abi.encodePacked(from, to, gameId, feeRate)));
        require(recoverSigner(message, signature) == owner(), "Invalid signature");

        _transfer(from, to, gameId, feeRate);
    }

    function withdrawFee(address to, uint256 amount) external onlyOwner nonReentrant {
        require(feeBalance >= amount, "Insufficent funds");
        feeBalance -= amount;
        (bool sent, ) = to.call{ value: amount }("sent");
        require(sent, "Failed to complete");
        emit WithdrawFee(to, amount, uint32(block.timestamp));
    }
}
