const hre = require("hardhat");

async function main() {
  console.log("=== Verifying Contracts on Sepolia ===\n");
  
  const contracts = [
    {
      name: "NFTMarketplace",
      address: "0x2e74cffD2aCF6C7a8dBC866739301206bA8b7779",
      args: ["0x4cb63735566465C26D867191A836B83B931D1820"]
    },
    {
      name: "ERC721Token",
      address: "0xbC32eC90e6F64c945eA37C8f193d7277205031cC",
      args: ["MyNFT721", "MNFT", "0x4cb63735566465C26D867191A836B83B931D1820"]
    },
    {
      name: "ERC1155Token", 
      address: "0xFB7163481F8bF32272E9dc2548FE700C1d2108D2",
      args: ["MyNFT1155", "MNFT1155", "https://example.com/api/token/{id}.json"]
    }
  ];

  for (const contract of contracts) {
    console.log(`Verifying ${contract.name}...`);
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.args,
      });
      console.log(`✅ ${contract.name} verified successfully!\n`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} already verified\n`);
      } else {
        console.log(`❌ Error verifying ${contract.name}:`, error.message, "\n");
      }
    }
  }
}

main().catch(console.error);