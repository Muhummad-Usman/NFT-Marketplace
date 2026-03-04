const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let marketplace, erc721Token, erc1155Token;
  let owner, seller, buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy(owner.address);

    // Deploy ERC721 token
    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    erc721Token = await ERC721Token.deploy(
      "TestNFT721",
      "TNFT",
      owner.address
    );

    // Deploy ERC1155 token
    const ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    erc1155Token = await ERC1155Token.deploy(
      "TestNFT1155",
      "TNFT1155",
      "https://example.com/api/token/{id}.json"
    );
  });

  describe("ERC721 Token", function () {
    it("Should mint ERC721 token with royalty", async function () {
      const tokenURI = "ipfs://QmTest123";
      const royaltyRecipient = seller.address;
      const royaltyFraction = 1000; // 10%
      
      await erc721Token.safeMint(
        seller.address,
        tokenURI,
        royaltyRecipient,
        royaltyFraction
      );
      
      expect(await erc721Token.ownerOf(0)).to.equal(seller.address);
      expect(await erc721Token.tokenURI(0)).to.equal(tokenURI);
    });
  });

  describe("ERC1155 Token", function () {
    it("Should mint ERC1155 token with royalty", async function () {
      const tokenURI = "ipfs://QmTest456";
      const royaltyRecipient = seller.address;
      const royaltyFraction = 500; // 5%
      
      // Track current token ID before minting
      const mintTx = await erc1155Token.mint(
        seller.address,
        10, // amount
        tokenURI,
        royaltyRecipient,
        royaltyFraction,
        "0x"
      );
      
      // Wait for transaction
      await mintTx.wait();
      
      // First token ID should be 1
      const tokenId = 1;
      expect(await erc1155Token.balanceOf(seller.address, tokenId)).to.equal(10);
      expect(await erc1155Token.uri(tokenId)).to.equal(tokenURI);
    });
  });

  describe("Marketplace", function () {
    it("Should list ERC721 token", async function () {
      // Mint token
      await erc721Token.safeMint(
        seller.address,
        "ipfs://QmTest123",
        seller.address,
        1000
      );
      
      // Approve marketplace
      await erc721Token.connect(seller).approve(marketplace.target, 0);
      
      // List token
      await marketplace.connect(seller).listToken(
        erc721Token.target,
        0,
        ethers.parseEther("1.0"),
        1,
        false
      );
      
      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(ethers.parseEther("1.0"));
      expect(listing.active).to.be.true;
    });

    it("Should list ERC1155 token", async function () {
      // Mint token (ID will be 1)
      await erc1155Token.mint(
        seller.address,
        5,
        "ipfs://QmTest456",
        seller.address,
        1000,
        "0x"
      );
      
      // Approve marketplace
      await erc1155Token.connect(seller).setApprovalForAll(marketplace.target, true);
      
      // List token
      await marketplace.connect(seller).listToken(
        erc1155Token.target,
        1, // tokenId
        ethers.parseEther("0.5"),
        2, // amount to sell
        true
      );
      
      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.amount).to.equal(2);
      expect(listing.isERC1155).to.be.true;
    });

    it("Should purchase ERC721 token", async function () {
      // Mint and list token
      await erc721Token.safeMint(
        seller.address,
        "ipfs://QmTest123",
        seller.address,
        1000
      );
      
      await erc721Token.connect(seller).approve(marketplace.target, 0);
      
      await marketplace.connect(seller).listToken(
        erc721Token.target,
        0,
        ethers.parseEther("1.0"),
        1,
        false
      );
      
      // Purchase
      await marketplace.connect(buyer).purchaseToken(1, {
        value: ethers.parseEther("1.0")
      });
      
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
      expect(await erc721Token.ownerOf(0)).to.equal(buyer.address);
    });
  });
});