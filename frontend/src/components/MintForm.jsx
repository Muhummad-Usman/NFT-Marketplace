import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContracts, getUser, connectWallet, autoSwitchNetwork } from '../utils/web3';
import { uploadToIPFS, uploadMetadataToIPFS, createNFTMetadata, isIPFSConfigured, testPinataConnection } from '../utils/ipfs';
import { CONTRACT_ADDRESSES, CONFIG_VERSION } from '../utils/config';

// Force cache refresh
console.log(' MintForm loaded - CONFIG_VERSION:', CONFIG_VERSION);
console.log(' Current contract addresses:', CONTRACT_ADDRESSES);

function MintForm() {
  const [nftType, setNftType] = useState('721');
  const [tokenName, setTokenName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [amount, setAmount] = useState('1');
  const [royalty, setRoyalty] = useState('10');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size based on type
      const maxSize = mediaType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for audio/image
      
      if (file.size > maxSize) {
        setMessage({ 
          type: 'error', 
          text: `${mediaType === 'video' ? 'Video' : mediaType === 'audio' ? 'Audio' : 'Image'} size must be less than ${mediaType === 'video' ? '50MB' : '10MB'}` 
        });
        return;
      }
      
      // Check file type
      const validTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
      };
      
      if (!validTypes[mediaType].includes(file.type)) {
        setMessage({ 
          type: 'error', 
          text: `Please upload a valid ${mediaType} file` 
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please upload a media file' });
      return;
    }

    if (!tokenName || !description) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setMessage({ type: 'warning', text: 'Connecting wallet...' });
    setLoading(true);

    try {
      // Auto-switch to correct network and connect wallet
      setMessage({ type: 'warning', text: 'Checking network...' });
      
      // Debug: Log current contract addresses
      console.log(' Current contract addresses:', {
        erc721: CONTRACT_ADDRESSES.erc721,
        marketplace: CONTRACT_ADDRESSES.marketplace,
        erc1155: CONTRACT_ADDRESSES.erc1155,
        configVersion: CONFIG_VERSION
      });
      
      const networkResult = await autoSwitchNetwork();
      
      if (!networkResult.success) {
        throw new Error(networkResult.error);
      }
      
      setMessage({ type: 'warning', text: 'Connecting wallet...' });
      await connectWallet();
      const { marketplace, erc721, erc1155 } = getContracts();
      const { address } = getUser();
      
      // Debug: Log contract instances
      console.log(' Contract instances:', {
        erc721: erc721?.target,
        marketplace: marketplace?.target,
        erc1155: erc1155?.target
      });

      // Check IPFS availability first
      let ipfsAvailable = false;
      if (isIPFSConfigured()) {
        const testResult = await testPinataConnection();
        ipfsAvailable = testResult.success;
      }
      
      let tokenURI = '';
      
      if (ipfsAvailable) {
        setMessage({ type: 'warning', text: 'Uploading media to IPFS...' });
        
        try {
          // Upload media file to IPFS
          const mediaResult = await uploadToIPFS(imageFile);
          if (!mediaResult.success) {
            throw new Error(mediaResult.error);
          }
          
          const mediaUrl = mediaResult.url; // ipfs:// format
          
          setMessage({ type: 'warning', text: 'Creating metadata...' });
          
          // Create metadata with IPFS media URL
          const metadata = createNFTMetadata(
            tokenName,
            description,
            mediaUrl,
            mediaType,
            [
              {
                trait_type: "Creator",
                value: address
              },
              {
                trait_type: "Type",
                value: nftType === '721' ? "ERC-721" : "ERC-1155"
              }
            ]
          );
          
          setMessage({ type: 'warning', text: 'Uploading metadata to IPFS...' });
          
          // Upload metadata to IPFS
          const metadataResult = await uploadMetadataToIPFS(metadata);
          if (!metadataResult.success) {
            throw new Error(metadataResult.error);
          }
          
          tokenURI = metadataResult.url; // ipfs:// format
          
          setMessage({ type: 'success', text: 'Files uploaded to IPFS successfully!' });
        } catch (ipfsError) {
          console.error('IPFS upload failed:', ipfsError);
          setMessage({ type: 'warning', text: 'IPFS upload failed, using fallback...' });
          
          // Fallback: Create minimal metadata without embedded image
          const fallbackMetadata = {
            name: tokenName,
            description: description,
            attributes: [
              {
                trait_type: "Media Type",
                value: mediaType
              },
              {
                trait_type: "Creator",
                value: address
              },
              {
                trait_type: "Storage",
                value: "Local"
              }
            ],
            created_at: new Date().toISOString()
          };
          
          // Create a simple data URI for metadata (much smaller)
          const metadataJson = JSON.stringify(fallbackMetadata);
          tokenURI = `data:application/json;base64,${btoa(metadataJson)}`;
        }
      } else {
        setMessage({ type: 'warning', text: 'IPFS not available, using local storage...' });
        
        // Fallback: Create minimal metadata without embedded image
        const fallbackMetadata = {
          name: tokenName,
          description: description,
          attributes: [
            {
              trait_type: "Media Type",
              value: mediaType
            },
            {
              trait_type: "Creator",
              value: address
            },
            {
              trait_type: "Storage",
              value: "Local"
            }
          ],
          created_at: new Date().toISOString()
        };
        
        // Create a simple data URI for metadata (much smaller)
        const metadataJson = JSON.stringify(fallbackMetadata);
        tokenURI = `data:application/json;base64,${btoa(metadataJson)}`;
      }

      setMessage({ type: 'warning', text: 'Minting NFT...' });

      // Convert royalty percentage to basis points (multiply by 100)
      const royaltyBps = Math.floor(parseFloat(royalty) * 100);

      if (nftType === '721') {
        // Mint ERC721 with smaller gas limit
        const tx = await erc721.safeMint(
          address,
          tokenURI,
          address,
          royaltyBps
        );
        await tx.wait();
      } else {
        // Mint ERC1155 with smaller gas limit
        const tx = await erc1155.mint(
          address,
          parseInt(amount),
          tokenURI,
          address,
          royaltyBps,
          "0x" // empty data parameter
        );
        await tx.wait();
      }

      setMessage({ 
        type: 'success', 
        text: 'NFT minted successfully! ' 
      });
      
      // Reset form
      setTokenName('');
      setDescription('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setMediaType('image');
      setAmount('1');
      setRoyalty('10');
      setNftType('721');
      
    } catch (error) {
      console.error('Minting error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to mint NFT';
      
      if (error.message.includes('out of gas')) {
        errorMessage = 'Transaction failed: Gas limit too low. Try again with higher gas limit.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas. Please add more ETH to your wallet.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('UNCONFIGURED_NAME') || error.code === 'UNCONFIGURED_NAME') {
        errorMessage = 'Contract not found on current network. Please ensure you are on the correct network (Localhost or Sepolia). Check the Network Status panel above.';
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">Mint New NFT</h2>
      
      <div className="form-group">
        <label>NFT Type</label>
        <select 
          value={nftType} 
          onChange={(e) => setNftType(e.target.value)}
        >
          <option value="721">ERC-721 (Unique)</option>
          <option value="1155">ERC-1155 (Multiple)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Token Name *</label>
        <input 
          type="text" 
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Enter NFT name"
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your NFT"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Media Type</label>
        <select 
          value={mediaType} 
          onChange={(e) => setMediaType(e.target.value)}
        >
          <option value="image">🖼️ Image</option>
          <option value="audio">🎵 Audio/Music</option>
          <option value="video">🎬 Video</option>
        </select>
      </div>

      <div className="form-group">
        <label>Upload {mediaType === 'image' ? 'Image' : mediaType === 'audio' ? 'Audio' : 'Video'} *</label>
        <input 
          type="file" 
          accept={mediaType === 'image' ? 'image/*' : mediaType === 'audio' ? 'audio/*' : 'video/*'}
          onChange={handleMediaUpload}
          style={{ display: 'none' }}
          id="media-upload"
        />
        <label 
          htmlFor="media-upload"
          style={{
            display: 'block',
            padding: '12px',
            border: '2px dashed #00ff00',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#1a1a2e',
            color: '#00ff00'
          }}
        >
          {imageFile ? `Selected: ${imageFile.name}` : `Click to upload ${mediaType}`}
        </label>
        
        {imagePreview && (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            {mediaType === 'image' ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  border: '1px solid #00ff00'
                }} 
              />
            ) : mediaType === 'audio' ? (
              <audio controls style={{ maxWidth: '300px' }}>
                <source src={imagePreview} type={imageFile?.type} />
                Your browser does not support audio.
              </audio>
            ) : (
              <video controls style={{ maxWidth: '300px', maxHeight: '200px' }}>
                <source src={imagePreview} type={imageFile?.type} />
                Your browser does not support video.
              </video>
            )}
          </div>
        )}
        
        <small>
          {mediaType === 'image' && 'Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB'}
          {mediaType === 'audio' && 'Supported formats: MP3, WAV, OGG, M4A. Max size: 10MB'}
          {mediaType === 'video' && 'Supported formats: MP4, WebM, OGG. Max size: 50MB'}
        </small>
      </div>

      {nftType === '1155' && (
        <div className="form-group">
          <label>Amount</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            placeholder="Number of copies"
          />
        </div>
      )}

      <div className="form-group">
        <label>Royalty Percentage (%)</label>
        <input 
          type="number" 
          value={royalty}
          onChange={(e) => setRoyalty(e.target.value)}
          min="0"
          max="50"
          step="0.1"
          placeholder="e.g., 10 for 10%"
        />
        <small>Earn this percentage on secondary sales</small>
      </div>

      <button 
        className="submit-btn"
        onClick={handleMint}
        disabled={loading}
      >
        {loading ? 'Minting...' : 'Mint NFT'}
      </button>

      {message.text && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
        <strong>Note:</strong> For production, integrate with IPFS/Pinata to upload 
        images and metadata. Update the IPFS_CONFIG in utils/config.js with your Pinata keys.
      </div>
    </div>
  );
}

export default MintForm;