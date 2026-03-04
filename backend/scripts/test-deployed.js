const hre = require("hardhat");

async function main() {
  console.log("=== Testing Deployed Contracts ===\n");
  
  // Contract addresses from deployment
  const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const ERC721_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const ERC1155_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  const [owner, seller, buyer] = await hre.ethers.getSigners();
  
  // Connect to deployed contracts
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const ERC721 = await hre.ethers.getContractFactory("ERC721Token");
  const ERC1155 = await hre.ethers.getContractFactory("ERC1155Token");
  
  const marketplace = await Marketplace.attach(MARKETPLACE_ADDRESS);
  const erc721 = await ERC721.attach(ERC721_ADDRESS);
  const erc1155 = await ERC1155.attach(ERC1155_ADDRESS);
  
  console.log("Connected to contracts:");
  console.log("- Marketplace:", await marketplace.getAddress());
  console.log("- ERC721:", await erc721.getAddress());
  console.log("- ERC1155:", await erc1155.getAddress());
  
  // Test 1: Mint ERC721
  console.log("\n🔹 Test 1: Minting ERC721...");
  const mintTx1 = await erc721.safeMint(
    seller.address,
    "ipfs://QmTestERC721",
    seller.address,
    1000 // 10% royalty
  );
  await mintTx1.wait();
  console.log("✓ Minted ERC721 Token ID 0 to:", seller.address);
  console.log("  Token URI:", await erc721.tokenURI(0));
  console.log("  Owner:", await erc721.ownerOf(0));
  
  // Test 2: Mint ERC1155
  console.log("\n🔹 Test 2: Minting ERC1155...");
  const mintTx2 = await erc1155.mint(
    seller.address,
    10, // amount
    "ipfs://QmTestERC1155",
    seller.address,
    500, // 5% royalty
    "0x"
  );
  await mintTx2.wait();
  console.log("✓ Minted ERC1155 Token ID 1");
  console.log("  Balance:", await erc1155.balanceOf(seller.address, 1));
  console.log("  Token URI:", await erc1155.uri(1));
  
  // Test 3: List ERC721 on Marketplace
  console.log("\n🔹 Test 3: Listing ERC721 on Marketplace...");
  
  // Approve marketplace
  await erc721.connect(seller).approve(await marketplace.getAddress(), 0);
  
  // List token
  const listTx = await marketplace.connect(seller).listToken(
    await erc721.getAddress(),
    0, // tokenId
    hre.ethers.parseEther("1.5"), // 1.5 ETH price
    1, // amount
    false // isERC1155
  );
  await listTx.wait();
  
  console.log("✓ Listed ERC721 Token ID 0 for 1.5 ETH");
  console.log("  Listing ID: 1");
  
  const listing = await marketplace.listings(1);
  console.log("  Listing active:", listing.active);
  console.log("  Listing price:", hre.ethers.formatEther(listing.price), "ETH");
  
  // Test 4: Purchase ERC721
  console.log("\n🔹 Test 4: Purchasing ERC721...");
  
  const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
  const purchaseTx = await marketplace.connect(buyer).purchaseToken(1, {
    value: hre.ethers.parseEther("1.5")
  });
  await purchaseTx.wait();
  
  console.log("✓ Purchased ERC721 Token ID 0");
  console.log("  New owner:", await erc721.ownerOf(0));
  console.log("  Listing now active:", (await marketplace.listings(1)).active);
  
  console.log("\n✅ All tests completed successfully!");
  console.log("\n=== NFT Marketplace Ready ===");
  console.log("You can now build your frontend to interact with these contracts.");
}

main().catch(console.error);