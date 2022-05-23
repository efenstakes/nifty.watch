const hre = require("hardhat");



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