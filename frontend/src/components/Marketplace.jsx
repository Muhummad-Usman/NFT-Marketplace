import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContracts, getUser, connectWallet } from '../utils/web3';
import { parseNFTMetadata, renderMedia, formatAttributes } from '../utils/metadata';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [purchasing, setPurchasing] = useState(null);
  const [nftMetadata, setNftMetadata] = useState({});

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // Try to connect wallet first, but don't fail if not connected
      try {
        await connectWallet();
      } catch (error) {
        console.warn("Wallet not connected:", error.message);
        setMessage({ type: 'warning', text: 'Connect wallet to see marketplace listings' });
        setLoading(false);
        return;
      }
      
      const { marketplace } = getContracts();
      
      // Check if marketplace contract is initialized
      if (!marketplace) {
        console.warn("Marketplace contract not initialized");
        setMessage({ type: 'error', text: 'Please connect your wallet first' });
        setLoading(false);
        return;
      }
      
      // Get total listings count
      const counter = await marketplace.listingCounter();
      const totalListings = parseInt(counter.toString());
      
      // Fetch all active listings
      const activeListings = [];
      
      for (let i = 1; i <= totalListings; i++) {
        try {
          const listing = await marketplace.listings(i);
          
          if (listing.active) {
            const listingData = {
              id: i,
              seller: listing.seller,
              tokenAddress: listing.tokenAddress,
              tokenId: listing.tokenId.toString(),
              price: listing.price.toString(),
              amount: listing.amount.toString(),
              isERC1155: listing.isERC1155
            };
            
            activeListings.push(listingData);
            
            // Fetch NFT metadata
            fetchNFTMetadata(listingData);
          }
        } catch (error) {
          console.error(`Error fetching listing ${i}:`, error);
        }
      }
      
      setListings(activeListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setMessage({ type: 'error', text: 'Failed to load listings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTMetadata = async (listing) => {
    try {
      const { erc721, erc1155 } = getContracts();
      
      let tokenURI;
      if (listing.isERC1155) {
        tokenURI = await erc1155.uri(listing.tokenId);
      } else {
        tokenURI = await erc721.tokenURI(listing.tokenId);
      }
      
      const metadataResult = await parseNFTMetadata(tokenURI);
      
      setNftMetadata(prev => ({
        ...prev,
        [`${listing.tokenAddress}-${listing.tokenId}`]: metadataResult
      }));
    } catch (error) {
      console.error(`Error fetching metadata for ${listing.tokenId}:`, error);
      
      // Handle "unconfigured name" error gracefully
      if (error.message.includes('UNCONFIGURED_NAME') || error.code === 'UNCONFIGURED_NAME') {
        setNftMetadata(prev => ({
          ...prev,
          [`${listing.tokenAddress}-${listing.tokenId}`]: {
            success: false,
            error: 'Contract not found on this network. Please ensure you are on the correct network.',
            metadata: {
              name: `NFT #${listing.tokenId}`,
              description: 'Contract not accessible on current network',
              attributes: []
            }
          }
        }));
      } else {
        setNftMetadata(prev => ({
          ...prev,
          [`${listing.tokenAddress}-${listing.tokenId}`]: {
            success: false,
            error: error.message,
            metadata: {
              name: `NFT #${listing.tokenId}`,
              description: 'Error loading metadata',
              attributes: []
            }
          }
        }));
      }
    }
  };

  const handlePurchase = async (listingId, price) => {
    setPurchasing(listingId);
    setMessage({ type: '', text: '' });
    
    try {
      const { marketplace } = getContracts();
      const { address } = getUser();
      
      if (!address) {
        throw new Error('Please connect your wallet first');
      }
      
      if (!marketplace) {
        throw new Error('Marketplace contract not initialized. Please connect your wallet first.');
      }
      
      const tx = await marketplace.purchaseToken(listingId, {
        value: price
      });
      
      await tx.wait();
      
      setMessage({ 
        type: 'success', 
        text: 'NFT purchased successfully!' 
      });
      
      // Refresh listings
      fetchListings();
      
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to purchase NFT' 
      });
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (priceWei) => {
    return ethers.formatEther(priceWei);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">Marketplace</h2>
        <div className="loading">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">NFT Marketplace Listings</h2>
      
      {message.text && (
        <div className={message.type} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="loading">
          No active listings available. Be the first to list an NFT!
        </div>
      ) : (
        <div className="nft-grid">
          {listings.map((listing) => {
            const metadataKey = `${listing.tokenAddress}-${listing.tokenId}`;
            const metadataResult = nftMetadata[metadataKey];
            const metadata = metadataResult?.metadata;
            
            return (
              <div key={listing.id} className="nft-card">
                <div className="nft-image" style={{ position: 'relative' }}>
                  {metadata && metadataResult?.success ? (
                    renderMedia(metadata, 'nft-media')
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00ff00',
                      fontSize: '14px'
                    }}>
                      {metadataResult ? 'Loading...' : 'NFT #' + listing.tokenId}
                      <br />
                      {listing.isERC1155 ? 'ERC-1155' : 'ERC-721'}
                    </div>
                  )}
                  
                  {metadata?.mediaType && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#00ff00',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {metadata.mediaType === 'image' ? '🖼️' : 
                       metadata.mediaType === 'audio' ? '🎵' : 
                       metadata.mediaType === 'video' ? '🎬' : '📄'}
                    </div>
                  )}
                </div>
                
                <div className="nft-info">
                  <div className="nft-name">
                    {metadata?.name || `${listing.isERC1155 ? 'Multi Token' : 'Unique NFT'} #${listing.tokenId}`}
                  </div>
                  
                  {metadata?.description && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#aaa', 
                      marginBottom: '10px',
                      lineHeight: '1.3',
                      maxHeight: '40px',
                      overflow: 'hidden'
                    }}>
                      {metadata.description}
                    </div>
                  )}
                  
                  <div className="nft-price">
                    {formatPrice(listing.price)} ETH
                  </div>
                  
                  {listing.isERC1155 && (
                    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
                      Amount: {listing.amount}
                    </div>
                  )}
                  
                  {metadata?.attributes && metadata.attributes.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {metadata.attributes.slice(0, 2).map((attr, index) => (
                        <div key={index} style={{
                          fontSize: '11px',
                          color: '#888',
                          backgroundColor: '#1a1a2e',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          display: 'inline-block',
                          margin: '2px'
                        }}>
                          {attr.trait_type}: {attr.value}
                        </div>
                      ))}
                      {metadata.attributes.length > 2 && (
                        <div style={{
                          fontSize: '11px',
                          color: '#888',
                          fontStyle: 'italic'
                        }}>
                          +{metadata.attributes.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                    Seller: {formatAddress(listing.seller)}
                  </div>
                  
                  <button 
                    className="buy-btn"
                    onClick={() => handlePurchase(listing.id, listing.price)}
                    disabled={purchasing === listing.id}
                  >
                    {purchasing === listing.id ? 'Purchasing...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={fetchListings}
          style={{
            background: 'transparent',
            border: '1px solid #00ff00',
            color: '#00ff00',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh Listings
        </button>
      </div>
    </div>
  );
}

export default Marketplace;