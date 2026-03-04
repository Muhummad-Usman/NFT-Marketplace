import React, { useState, useEffect } from 'react';
import { connectWallet, getBalance, onAccountsChanged, onChainChanged, switchToSepolia } from '../utils/web3';

function Wallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
    setupListeners();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
          updateBalance(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const setupListeners = () => {
    onAccountsChanged((newAddress) => {
      if (newAddress) {
        setIsConnected(true);
        setUserAddress(newAddress);
        updateBalance(newAddress);
      } else {
        setIsConnected(false);
        setUserAddress('');
        setBalance('0');
      }
    });

    onChainChanged((chainId) => {
      console.log("Chain changed to:", chainId);
      // Refresh page on chain change
      window.location.reload();
    });
  };

  const updateBalance = async (address) => {
    try {
      const bal = await getBalance();
      setBalance(bal);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Switch to Sepolia first
      await switchToSepolia();
      
      // Connect wallet
      const { userAddress: address } = await connectWallet();
      
      setIsConnected(true);
      setUserAddress(address);
      await updateBalance(address);
    } catch (error) {
      setError(error.message || "Failed to connect wallet");
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-section">
      {isConnected ? (
        <div className="wallet-info">
          <div>{formatAddress(userAddress)}</div>
          <div className="balance">{parseFloat(balance).toFixed(4)} ETH</div>
        </div>
      ) : (
        <button 
          className="connect-btn"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Wallet;