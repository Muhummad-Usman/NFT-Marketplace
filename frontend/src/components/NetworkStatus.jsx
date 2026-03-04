import React, { useState, useEffect } from 'react';
import { getCurrentNetwork } from '../utils/web3';
import { NETWORK_CONFIG, CONTRACT_ADDRESSES, CONFIG_VERSION } from '../utils/config';

function NetworkStatus() {
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [networkName, setNetworkName] = useState('Unknown');

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
        
        if (network === NETWORK_CONFIG.localhost.chainId) {
          setNetworkName('Localhost (Hardhat)');
        } else if (network === NETWORK_CONFIG.sepolia.chainId) {
          setNetworkName('Sepolia Testnet');
        } else {
          setNetworkName(`Unknown (${network})`);
        }
      } catch (error) {
        console.error('Error checking network:', error);
        setNetworkName('Error detecting network');
      }
    };

    checkNetwork();
    
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, []);

  const getNetworkColor = () => {
    if (currentNetwork === NETWORK_CONFIG.localhost.chainId) return '#00ff00';
    if (currentNetwork === NETWORK_CONFIG.sepolia.chainId) return '#ffaa00';
    return '#ff5555';
  };

  return (
    <div style={{
      fontSize: '12px',
      color: '#aaa',
      padding: '5px 10px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0,0,0,0.3)',
      border: `1px solid ${getNetworkColor()}`,
      margin: '5px 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          🌐 Network: <strong style={{ color: getNetworkColor() }}>{networkName}</strong>
        </span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          v{CONFIG_VERSION}
        </span>
      </div>
      
      {currentNetwork && (
        <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.8 }}>
          <div>Marketplace: {CONTRACT_ADDRESSES.marketplace.slice(0, 8)}...{CONTRACT_ADDRESSES.marketplace.slice(-6)}</div>
          <div>ERC721: {CONTRACT_ADDRESSES.erc721.slice(0, 8)}...{CONTRACT_ADDRESSES.erc721.slice(-6)}</div>
          <div>ERC1155: {CONTRACT_ADDRESSES.erc1155.slice(0, 8)}...{CONTRACT_ADDRESSES.erc1155.slice(-6)}</div>
        </div>
      )}
      
      {currentNetwork !== NETWORK_CONFIG.localhost.chainId && 
       currentNetwork !== NETWORK_CONFIG.sepolia.chainId && (
        <div style={{ marginTop: '5px', color: '#ff5555', fontSize: '10px' }}>
          ⚠️ Please switch to Localhost or Sepolia network
        </div>
      )}
    </div>
  );
}

export default NetworkStatus;
