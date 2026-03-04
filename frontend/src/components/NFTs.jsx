import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContracts, getUser } from '../utils/web3';
import { CONTRACT_ADDRESSES } from '../utils/config';
import { parseNFTMetadata, renderMedia, formatAttributes } from '../utils/metadata';

function NFTs() {
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingNFT, setListingNFT] = useState(null);
  const [listPrice, setListPrice] = useState('');
  const [listAmount, setListAmount] = useState('1');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [nftMetadata, setNftMetadata] = useState({});

  useEffect(() => {
    fetchMyNFTs();
  }, []);

  const fetchMyNFTs = async () => {
    try {
      const { erc721, erc1155 } = getContracts();
      const { address } = getUser();
      
      if (!address) {
        setMyNFTs([]);
        setLoading(false);
        return;
      }

      const nfts = [];

      // Fetch ERC721 NFTs
      try {
        // For simplicity, we'll check first 10 tokens
        // In production, you'd track token IDs from mint events
        for (let i = 0; i < 10; i++) {
          try {
            const owner = await erc721.ownerOf(i);
            if (owner.toLowerCase() === address.toLowerCase()) {
              const tokenURI = await erc721.tokenURI(i);
              
              nfts.push({
                id: i.toString(),
                type: '721',
                tokenURI: tokenURI,
                amount: '1',
                tokenAddress: CONTRACT_ADDRESSES.erc721
              });
              
              // Fetch metadata
              fetchNFTMetadata(i.toString(), '721', tokenURI, CONTRACT_ADDRESSES.erc721);
            }
          } catch (error) {
            // Token doesn't exist, continue
          }
        }
      } catch (error) {
        console.error("Error fetching ERC721 NFTs:", error);
      }

      // Fetch ERC1155 NFTs
      try {
        // Check first 10 token IDs
        for (let i = 1; i <= 10; i++) {
          try {
            const balance = await erc1155.balanceOf(address, i);
            if (parseInt(balance.toString()) > 0) {
              const tokenURI = await erc1155.uri(i);
              
              nfts.push({
                id: i.toString(),
                type: '1155',
                tokenURI: tokenURI,
                amount: balance.toString(),
                tokenAddress: CONTRACT_ADDRESSES.erc1155
              });
              
              // Fetch metadata
              fetchNFTMetadata(i.toString(), '1155', tokenURI, CONTRACT_ADDRESSES.erc1155);
            }
          } catch (error) {
            // Token doesn't exist or error, continue
          }
        }
      } catch (error) {
        console.error("Error fetching ERC1155 NFTs:", error);
      }

      setMyNFTs(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setMessage({ type: 'error', text: 'Failed to load NFTs' });
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTMetadata = async (tokenId, type, tokenURI, tokenAddress) => {
    try {
      const metadataResult = await parseNFTMetadata(tokenURI);
      
      setNftMetadata(prev => ({
        ...prev,
        [`${tokenAddress}-${tokenId}`]: metadataResult
      }));
    } catch (error) {
      console.error(`Error fetching metadata for ${tokenId}:`, error);
    }
  };

  const handleListNFT = async (nft) => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid price' });
      return;
    }

    setMessage({ type: '', text: '' });

    try {
      const { marketplace, erc721, erc1155 } = getContracts();
      const { address } = getUser();

      // Convert price to wei
      const priceWei = ethers.parseEther(listPrice);
      
      if (nft.type === '721') {
        // Approve marketplace for ERC721
        const approveTx = await erc721.approve(
          CONTRACT_ADDRESSES.marketplace,
          nft.id
        );
        await approveTx.wait();

        // List ERC721
        const listTx = await marketplace.listToken(
          CONTRACT_ADDRESSES.erc721,
          nft.id,
          priceWei,
          1,
          false
        );
        await listTx.wait();
      } else {
        // For ERC1155, check amount
        const listAmt = parseInt(listAmount);
        if (listAmt <= 0 || listAmt > parseInt(nft.amount)) {
          throw new Error(`Invalid amount. You have ${nft.amount} of this token.`);
        }

        // Approve marketplace for ERC1155
        const approveTx = await erc1155.setApprovalForAll(
          CONTRACT_ADDRESSES.marketplace,
          true
        );
        await approveTx.wait();

        // List ERC1155
        const listTx = await marketplace.listToken(
          CONTRACT_ADDRESSES.erc1155,
          nft.id,
          priceWei,
          listAmt,
          true
        );
        await listTx.wait();
      }

      setMessage({ 
        type: 'success', 
        text: 'NFT listed successfully on marketplace!' 
      });
      
      setListingNFT(null);
      setListPrice('');
      setListAmount('1');
      
      // Refresh NFTs
      fetchMyNFTs();
      
    } catch (error) {
      console.error("Listing error:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to list NFT' 
      });
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">My NFTs</h2>
        <div className="loading">Loading your NFTs...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">My NFT Collection</h2>
      
      {message.text && (
        <div className={message.type} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      {myNFTs.length === 0 ? (
        <div className="loading">
          You don't own any NFTs yet. Mint your first NFT!
        </div>
      ) : (
        <div className="nft-grid">
          {myNFTs.map((nft) => {
            const metadataKey = `${nft.tokenAddress}-${nft.id}`;
            const metadataResult = nftMetadata[metadataKey];
            const metadata = metadataResult?.metadata;
            
            return (
              <div key={`${nft.type}-${nft.id}`} className="nft-card">
                <div className="nft-image" style={{ position: 'relative' }}>
                  {metadata && metadataResult?.success ? (
                    renderMedia(metadata, 'nft-media')
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, #2a1a2e, #1a162e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ff00ff',
                      fontSize: '14px'
                    }}>
                      {metadataResult ? 'Loading...' : `${nft.type === '721' ? 'ERC-721' : 'ERC-1155'}`}
                      <br />
                      ID: {nft.id}
                      {nft.type === '1155' && ` (${nft.amount} owned)`}
                    </div>
                  )}
                  
                  {metadata?.mediaType && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#ff00ff',
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
                    {metadata?.name || `${nft.type === '721' ? 'Unique NFT' : 'Multi Token'} #${nft.id}`}
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
                  
                  {nft.type === '1155' && (
                    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
                      Amount: {nft.amount}
                    </div>
                  )}
                  
                  {metadata?.attributes && metadata.attributes.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {metadata.attributes.slice(0, 2).map((attr, index) => (
                        <div key={index} style={{
                          fontSize: '11px',
                          color: '#888',
                          backgroundColor: '#2a1a2e',
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
                  
                  {nft.tokenURI && nft.tokenURI.startsWith('http') && (
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                      <a 
                        href={nft.tokenURI} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#00aaff' }}
                      >
                        View Metadata
                      </a>
                    </div>
                  )}
                  
                  {listingNFT?.id === nft.id && listingNFT?.type === nft.type ? (
                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="number"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="Price in ETH"
                        style={{ marginBottom: '10px' }}
                      />
                      
                      {nft.type === '1155' && (
                        <input
                          type="number"
                          value={listAmount}
                          onChange={(e) => setListAmount(e.target.value)}
                          placeholder={`Amount (max: ${nft.amount})`}
                          style={{ marginBottom: '10px' }}
                          min="1"
                          max={nft.amount}
                        />
                      )}
                      
                      <button 
                        className="buy-btn"
                        onClick={() => handleListNFT(nft)}
                      >
                        Confirm List
                      </button>
                      
                      <button 
                        onClick={() => setListingNFT(null)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ff5555',
                          color: '#ff5555',
                          width: '100%',
                          padding: '8px',
                          marginTop: '5px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="buy-btn"
                      onClick={() => setListingNFT(nft)}
                    >
                      List on Marketplace
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={fetchMyNFTs}
          style={{
            background: 'transparent',
            border: '1px solid #00ff00',
            color: '#00ff00',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh My NFTs
        </button>
      </div>
    </div>
  );
}

export default NFTs;