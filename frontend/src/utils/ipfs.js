import axios from 'axios';
import { IPFS_CONFIG } from './config';

// Pinata JWT token - GET THIS FROM YOUR PINATA DASHBOARD
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

// Check if JWT is configured
export function isIPFSConfigured() {
  return !!PINATA_JWT;
}

// Upload file to IPFS via Pinata (JWT version)
export async function uploadToIPFS(file) {
  try {
    if (!isIPFSConfigured()) {
      throw new Error('Pinata JWT not configured. Add REACT_APP_PINATA_JWT to .env');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'nft-marketplace',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${PINATA_JWT}`, // ✅ JWT token
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      url: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error.response?.data?.error?.details || error.message,
    };
  }
}

// Upload JSON metadata to IPFS (JWT version)
export async function uploadMetadataToIPFS(metadata) {
  try {
    if (!isIPFSConfigured()) {
      throw new Error('Pinata JWT not configured. Add REACT_APP_PINATA_JWT to .env');
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`, // ✅ JWT token
        },
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      url: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    return {
      success: false,
      error: error.response?.data?.error?.details || error.message,
    };
  }
}

// Test Pinata connection
export async function testPinataConnection() {
  try {
    if (!isIPFSConfigured()) {
      return {
        success: false,
        error: 'JWT not configured'
      };
    }

    const response = await axios.get(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    return {
      success: response.status === 200,
      authenticated: response.data.authenticated,
      message: 'Pinata connection successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

// Get IPFS gateway URL
export function getIPFSUrl(ipfsHash) {
  if (ipfsHash.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash.replace('ipfs://', '')}`;
  }
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

// Fetch data from IPFS
export async function fetchFromIPFS(ipfsHash) {
  try {
    const url = getIPFSUrl(ipfsHash);
    const response = await axios.get(url);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Create complete NFT metadata
export function createNFTMetadata(name, description, mediaUrl, mediaType, attributes = []) {
  const metadata = {
    name: name,
    description: description,
    attributes: [
      {
        trait_type: 'Media Type',
        value: mediaType,
      },
      ...attributes,
    ],
    created_at: new Date().toISOString(),
  };

  // Add media URL based on type
  if (mediaType === 'image') {
    metadata.image = mediaUrl;
  } else if (mediaType === 'audio') {
    metadata.animation_url = mediaUrl;
    metadata.image = 'https://ipfs.io/ipfs/QmXZxLkNvxhZq8x6kFbLpVEXJb4vK6NqZ3kF7a9qL3q9mN/audio-placeholder.png';
  } else if (mediaType === 'video') {
    metadata.animation_url = mediaUrl;
    metadata.image = 'https://ipfs.io/ipfs/QmXZxLkNvxhZq8x6kFbLpVEXJb4vK6NqZ3kF7a9qL3q9mN/video-placeholder.png';
  }

  return metadata;
}
// Add this function to ipfs.js (after testPinataConnection)
export async function checkIPFSAvailability() {
  try {
    if (!isIPFSConfigured()) {
      return {
        available: false,
        error: 'Pinata JWT not configured'
      };
    }

    const testResult = await testPinataConnection();
    return {
      available: testResult.success,
      authenticated: testResult.authenticated,
      message: testResult.message,
      error: testResult.error
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
}