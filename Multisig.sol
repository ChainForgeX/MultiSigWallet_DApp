//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Multisig{
    address[] public owners;
    uint256 public required;
    uint256 public transactionCount;

    struct Transaction{
        address to;
        uint256 value;
        bool executed;
        uint256 approvals;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    constructor(address[] memory _owners, uint256 _required){
        require(_owners.length > 0, "Owners Required");
        require(_required > 0 && _required <= _owners.length, "Invalid Owners Required");

        owners = _owners;
        required = _required;
    }

    receive() external payable{}

    modifier onlyOwner(){
        bool isOwner = false;

        for(uint256 i = 0; i < owners.length; i++){
            if(msg.sender == owners[i]){
                isOwner = true;
                break;
            }
        }

        require(isOwner, "Not Owner");

        _;
    }

    function submitTransaction(address _to, uint256 _value) public onlyOwner{
        transactionCount++;

        transactions[transactionCount] = Transaction(
            _to,
            _value,
            false,
            0
        );
    }

    function approveTransaction(uint256 _txId) public onlyOwner{
        Transaction storage transaction = transactions[_txId];

        require(!transaction.executed, "Already Executed");
        require(!approved[_txId][msg.sender], "Already Approved");
        require( _txId > 0 && _txId <= transactionCount, "Transaction Not Found");

        approved[_txId][msg.sender] = true;

        transaction.approvals++;
    }

    function executeTransaction(uint256 _txId) public onlyOwner{
        Transaction storage transaction = transactions[_txId];

        require(!transaction.executed, "Already Executed");
        require(transaction.approvals >= required, "Not enough Approvals");
        require( _txId > 0 && _txId <= transactionCount, "Transaction Not Found");

        transaction.executed = true;

        payable(transaction.to).transfer(transaction.value);
    }
}