import {useState, useEffect} from "react";
import {ethers} from "ethers";
import {MultisigABI} from "../abi/MultisigABI.js";
 
function Dashboard(){
    const[accounts, setAccounts] = useState("");
    const[balance, setBalance] = useState("0");
    const[required, setRequired] = useState("0");
    const[depositAmount, setDepositAmount] = useState("");
    const[recipient, setRecipient] = useState("");
    const[txAmount, setTxAmount] = useState("");
    const[transactions, setTransactions] = useState([]);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const connectWallet = async() =>{
        if(!window.ethereum){
            alert("Install Metamask");
            return;
        }

        const accounts = await window.ethereum.request({
            method : "eth_requestAccounts"
        });

        setAccounts(accounts[0]);
        await loadData();
    };

    const loadData = async() =>{
        const provider = new ethers.BrowserProvider(window.ethereum);

        const contract = new ethers.Contract(
            contractAddress,
            MultisigABI,
            provider
        );

        const walletBalance = await provider.getBalance(contractAddress);
        const requiredApprovals = await contract.required();

        setBalance(ethers.formatEther(walletBalance));
        setRequired(requiredApprovals.toString());

        await loadTransactions();
    };

    const depositETH = async() =>{
        if(!depositAmount){
            alert("Enter Amount");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
            to : contractAddress,
            value : ethers.parseEther(depositAmount)
        });

        await tx.wait();

        alert("Deposit Successful");
        setDepositAmount("");
        await loadData();
    };

    const submitTransaction = async() =>{
        if(!recipient || !txAmount){
            alert("Required All Fields");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
            contractAddress,
            MultisigABI,
            signer
        );

        const tx = await contract.submitTransaction(
            recipient,
            ethers.parseEther(txAmount)
        );

        await tx.wait();

        alert("Transaction Submitted");

        setRecipient("");
        setTxAmount("");

        await loadTransactions();
    };

    const loadTransactions = async() =>{
        const provider = new ethers.BrowserProvider(window.ethereum);

        const contract = new ethers.Contract(
            contractAddress,
            MultisigABI,
            provider
        );

        const count = Number (await contract.transactionCount());

        const items = [];

        for(let i = 0; i <= count; i++){
            const tx = await contract.transactions(i);

            items.push({
                id : i,
                to : tx.to,
                value : ethers.formatEther(tx.value),
                executed : tx.executed,
                approvals : tx.approvals.toString()
            });
        }

        setTransactions(items);
    };

    const approveTransaction = async(txId)=>{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
            contractAddress,
            MultisigABI,
            signer
        );

        const tx = await contract.approveTransaction(txId);

        await tx.wait();

        alert("Transaction Approved");

        await loadTransactions();
    };

    const executeTransaction = async(txId) =>{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
            contractAddress,
            MultisigABI,
            signer
        );

        const tx = await contract.executeTransaction(txId);

        await tx.wait();

        alert("Transaction Executed");

        await loadTransactions();
        await loadData();
    };

    return(
        <div>

            <button onClick = {connectWallet}>Connect Wallet</button>
            <p>{accounts}</p>

            <div className = "dashboard">
                <h1> MULTISIG WALLET </h1>
            </div>

            <div className = "stats">
                <div className = "card">
                    <h3>Wallet Balance</h3>
                    <p>{balance} ETH</p>
                </div>

                <div className = "card">
                    <h3>Required Approvals</h3>
                    <p>{required}</p>
                </div>
            </div>

            <div className = "card">
                <h2>Deposit ETH</h2>

                <input
                type = "text"
                placeholder = "Amount in ETH"
                value = {depositAmount}
                onChange = {(e)=> setDepositAmount(e.target.value)}
                />

                <button onClick = {depositETH}>Deposit</button>
            </div>

            <div className = "card">
                <h2>Create Transaction</h2>

                <input
                type = "text"
                placeholder = "Recipient Address"
                value = {recipient}
                onChange = {(e)=> setRecipient(e.target.value)}
                />

                <input
                type = "text"
                placeholder = "Amount in ETH"
                value = {txAmount}
                onChange = {(e)=> setTxAmount(e.target.value)}
                />

                <button onClick = {submitTransaction}>Submit Transaction</button>
            </div>

            <div className = "card">
                <h2>Transaction</h2>
                {
                    transactions.map((tx)=>(
                        <div key = {tx.id} className = "transaction">
                            <h3> TX # {tx.id} </h3>
                            <p> To : {tx.to} </p>
                            <p> Amount : {tx.value} </p>
                            <p> Approval : {tx.approvals} </p>
                            <p> Executed : {tx.executed ? "Yes" : "No"} </p>

                            <button onClick = {()=> approveTransaction(tx.id)}>Approve</button>
                            <button onClick = {()=> executeTransaction(tx.id)}>Execute</button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default Dashboard;