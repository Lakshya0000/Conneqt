// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract DeSciToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion Tokens
    mapping(address => bool) public authorizedContracts; // Contracts that can distribute rewards

    event RewardsDistributed(address indexed recipient, uint256 amount);
    event AuthorizedContract(address indexed contractAddress, bool status);
    event FundsAdded(address indexed sender, uint256 amount);

    constructor() ERC20("DeSciToken", "DST") Ownable(msg.sender){
        _mint(address(this), 100_000_000 * 10**18); // Mint initial 100M tokens to contract
    }

    /// @notice Allows anyone to distribute rewards, but only from contract balance
    function distributeRewards(address recipient, uint256 amount) external {
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        _transfer(address(this), recipient, amount);
        emit RewardsDistributed(recipient, amount);
    }

    /// @notice Allows users to add funds to the contract
    function depositTokens(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        emit FundsAdded(msg.sender, amount);
    }

    /// @notice Admin can approve/disapprove external reward distribution contracts
    function setAuthorizedContract(address contractAddress, bool status) external onlyOwner {
        authorizedContracts[contractAddress] = status;
        emit AuthorizedContract(contractAddress, status);
    }
}
