import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getUser } from '../utils/web3';
import { royaltyTracker, formatSaleBreakdown, getNFTRoyaltyInfo } from '../utils/royalties';

function RoyaltyDashboard() {
  const [userAddress, setUserAddress] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const { address } = getUser();
      if (address) {
        setUserAddress(address);
        setTotalEarnings(royaltyTracker.getFormattedEarnings(address));
        setTransactions(royaltyTracker.getTransactionHistory(address));
      }
      setLoading(false);
    };

    loadData();
    
    // Listen for wallet changes
    const interval = setInterval(() => {
      const { address } = getUser();
      if (address && address !== userAddress) {
        setUserAddress(address);
        setTotalEarnings(royaltyTracker.getFormattedEarnings(address));
        setTransactions(royaltyTracker.getTransactionHistory(address));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userAddress]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all royalty data?')) {
      royaltyTracker.clearData();
      setTotalEarnings('0');
      setTransactions([]);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">Royalty Dashboard</h2>
        <div className="loading">Loading royalty data...</div>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="section">
        <h2 className="section-title">Royalty Dashboard</h2>
        <div className="loading">Please connect your wallet to view royalty earnings</div>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">Royalty Dashboard</h2>
        <button 
          onClick={clearData}
          style={{
            background: 'transparent',
            border: '1px solid #ff5555',
            color: '#ff5555',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Clear Data
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, #1a2a1a, #2a1a2a)', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        border: '1px solid #333'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
            Total Royalty Earnings
          </div>
          <div style={{ fontSize: '36px', color: '#00ff00', fontWeight: 'bold', marginBottom: '10px' }}>
            {totalEarnings} ETH
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            From {transactions.length} secondary sales
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="loading">
          No royalty earnings yet. When your NFTs are resold, you'll earn royalties here!
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#00ff00', marginBottom: '20px', fontSize: '16px' }}>
            Recent Royalty Transactions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {transactions.slice().reverse().map((tx, index) => (
              <div 
                key={index} 
                style={{
                  background: '#0f0f23',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                      NFT #{tx.tokenId} Resold
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                      {tx.formattedDate}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Sale Price: <span style={{ color: '#00ff00' }}>{ethers.formatEther(tx.salePrice)} ETH</span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#ff00ff',
                      marginBottom: '5px'
                    }}>
                      +{ethers.formatEther(tx.royaltyAmount)} ETH
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      Royalty Earned
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#1a1a2e', borderRadius: '8px' }}>
        <h4 style={{ color: '#00ff00', marginBottom: '10px', fontSize: '14px' }}>
          How Royalties Work
        </h4>
        <ul style={{ fontSize: '12px', color: '#aaa', paddingLeft: '20px', lineHeight: '1.5' }}>
          <li>When you mint an NFT, you set a royalty percentage (0-50%)</li>
          <li>Every time your NFT is resold on the marketplace, you earn that percentage</li>
          <li>Royalties are automatically distributed to your wallet</li>
          <li>Royalties are calculated from the sale price before platform fees</li>
        </ul>
      </div>
    </div>
  );
}

export default RoyaltyDashboard;
