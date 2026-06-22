const {ethers} = require("hardhat");

async function main(){
    const Multisig = await ethers.getContractFactory("Multisig");
    const [owner1, owner2, owner3] = await ethers.getSigners();
    const multisig = await Multisig.deploy([owner1.address, owner2.address, owner3.address], 2);

    await multisig.waitForDeployment();

    console.log("Multisig deployed at:", await multisig.getAddress());
}

main().catch((error)=>{
    console.log(error);
    process.exitCode = 1;
});