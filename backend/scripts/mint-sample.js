const { PinataSDK } = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function uploadToIPFS(filePath, metadata) {
  const pinata = new PinataSDK({
    pinataJWT: process.env.PINATA_JWT
  });

  try {
    // Upload file to IPFS
    const fileStream = fs.createReadStream(filePath);
    const fileUpload = await pinata.upload.stream(fileStream);
    console.log("File uploaded to IPFS:", fileUpload.IpfsHash);

    // Create metadata
    const metadataWithImage = {
      ...metadata,
      image: `ipfs://${fileUpload.IpfsHash}`,
      animation_url: metadata.animation_url ? `ipfs://${fileUpload.IpfsHash}` : undefined
    };

    // Upload metadata to IPFS
    const metadataUpload = await pinata.upload.json(metadataWithImage);
    console.log("Metadata uploaded to IPFS:", metadataUpload.IpfsHash);

    return `ipfs://${metadataUpload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

async function mintSampleNFT() {
  // This script would be called after deployment
  // You would need to interact with your deployed contracts here
  console.log("Sample minting script - implement based on your needs");
  
  // Example for uploading an image
  /*
  const imagePath = path.join(__dirname, '../assets/sample.jpg');
  const metadata = {
    name: "My NFT",
    description: "A sample NFT",
    attributes: [
      { trait_type: "Type", value: "Sample" }
    ]
  };
  
  const tokenURI = await uploadToIPFS(imagePath, metadata);
  console.log("Token URI:", tokenURI);
  
  // Then use this URI to mint NFTs via your smart contracts
  */
}

mintSampleNFT().catch(console.error);