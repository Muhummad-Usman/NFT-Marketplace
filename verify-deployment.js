const { ethers } = require("hardhat");

async function verifyDeployment() {
  console.log("🔍 Verifying contract deployment...");
  
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Contract addresses based on your deployment output
  const contracts = {
    marketplace: "0x96D052e194287Ef980D45B43234762C8ADD9c89E",
    erc721: "0xB22679365f71552Fc6448f99891e2e63b04f020E",
    erc1155: "0x36478ed8b1CacC31ca1709b1013688fdB9c7Be7b"
  };
  
  try {
    // Verify Marketplace contract
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = Marketplace.attach(contracts.marketplace);
    const listingCount = await marketplace.listingCounter();
    console.log(`✅ Marketplace contract verified - Listings: ${listingCount}`);
    
    // Verify ERC721 contract
    const ERC721 = await ethers.getContractFactory("ERC721Token");
    const erc721 = ERC721.attach(contracts.erc721);
    const name = await erc721.name();
    const symbol = await erc721.symbol();
    console.log(`✅ ERC721 contract verified - ${name} (${symbol})`);
    
    // Verify ERC1155 contract
    const ERC1155 = await ethers.getContractFactory("ERC1155Token");
    const erc1155 = ERC1155.attach(contracts.erc1155);
    const erc1155Name = await erc1155.name();
    const erc1155Symbol = await erc1155.symbol();
    console.log(`✅ ERC1155 contract verified - ${erc1155Name} (${erc1155Symbol})`);
    
    console.log("\n🎉 All contracts verified successfully!");
    console.log("\n📋 Contract Addresses for Frontend:");
    console.log(`   Marketplace: ${contracts.marketplace}`);
    console.log(`   ERC721: ${contracts.erc721}`);
    console.log(`   ERC1155: ${contracts.erc1155}`);
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

verifyDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
