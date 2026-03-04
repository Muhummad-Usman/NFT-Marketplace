const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // FIXED: Use provider.getBalance() instead of deployer.getBalance()
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy NFTMarketplace
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(deployer.address);
  console.log("NFTMarketplace deployed to:", await marketplace.getAddress());

  // Deploy ERC721Token
  const ERC721Token = await hre.ethers.getContractFactory("ERC721Token");
  const erc721Token = await ERC721Token.deploy(
    "MyNFT721",
    "MNFT",
    deployer.address
  );
  console.log("ERC721Token deployed to:", await erc721Token.getAddress());

  // Deploy ERC1155Token
  const ERC1155Token = await hre.ethers.getContractFactory("ERC1155Token");
  const erc1155Token = await ERC1155Token.deploy(
    "MyNFT1155",
    "MNFT1155",
    "https://example.com/api/token/{id}.json"
  );
  console.log("ERC1155Token deployed to:", await erc1155Token.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      marketplace: await marketplace.getAddress(),
      erc721Token: await erc721Token.getAddress(),
      erc1155Token: await erc1155Token.getAddress()
    },
    deployer: deployer.address
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `deployment-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments directory");
  
  // Return addresses for frontend use
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });