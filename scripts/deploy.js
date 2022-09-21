const hre = require("hardhat");


// 1. 0xAcc2D4130F9FA770F39d68B6C408277F52df0cFd
// g1. 0x8805E4bf7E7F006331046c75bc35636c5004e44E
async function main() {
  // get the account to deploy the contract
  const [ deployer ] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address); 
 
  // We get the contract to deploy
  
  // NFTCollection
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nFTCollection = await NFTCollection.deploy();

  await nFTCollection.deployed();

  console.log("nFTCollection deployed to:", nFTCollection.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});