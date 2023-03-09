// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./PayableContext.sol";

contract PetoBetContract is
    PayableContext,
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

    //Variables, modifiers, events------------------------

    mapping(address => FundItem) private _balances;

    uint256 feeBalance;

    uint256 constant DECIMAL_FACTOR = 1e18;

    struct FundItem {
        uint256 free;
        uint256 locked;
    }

    modifier onlySufficentFunds(address account, uint256 amount) {
        FundItem storage fund = _balances[account];
        require(fund.free >= amount, "Insufficent funds");
        _;
    }

    event Deposit(address indexed account, uint256 amount, uint32 timestamp);

    event Withdraw(address indexed account, uint256 amount, uint32 timestamp);

    event Lock(address indexed account, uint256 amount, uint32 timestamp);

    event Transfer(
        address indexed from,
        address indexed to,
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

    function lock(address account, uint256 amount) public onlySufficentFunds(account, amount) {
        FundItem storage fund = _balances[account];
        fund.free -= amount;
        fund.locked += amount;
        emit Lock(account, amount, uint32(block.timestamp));
    }

    function pairLock(address account1, address account2, uint256 amount) external onlyOwner {
        lock(account1, amount);
        lock(account2, amount);
    }

    function transfer(
        address from,
        address to,
        uint256 amount,
        uint256 feeRate
    ) external onlyOwner {
        require(feeRate < 100 * DECIMAL_FACTOR, "feeRate must be less 100");

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

        emit Transfer(from, to, amount, feeRate, uint32(block.timestamp));
    }

    function withdrawFee(address to, uint256 amount) external onlyOwner nonReentrant {
        require(feeBalance >= amount, "Insufficent funds");
        feeBalance -= amount;
        (bool sent, ) = to.call{ value: amount }("sent");
        require(sent, "Failed to complete");
        emit WithdrawFee(to, amount, uint32(block.timestamp));
    }
}
