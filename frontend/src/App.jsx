import React, { useState } from 'react';
import Wallet from './components/Wallet';
import MintForm from './components/MintForm';
import Marketplace from './components/Marketplace';
import NFTs from './components/NFTs';
import RoyaltyDashboard from './components/RoyaltyDashboard';
import NetworkStatus from './components/NetworkStatus';
import './styles.css';

function App() {
  const [activeTab, setActiveTab] = useState('marketplace');

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">🎨 NFT Marketplace</div>
        
        <nav className="nav-links">
          <a 
            href="#marketplace" 
            className={`nav-link ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </a>
          <a 
            href="#mint" 
            className={`nav-link ${activeTab === 'mint' ? 'active' : ''}`}
            onClick={() => setActiveTab('mint')}
          >
            Mint NFT
          </a>
          <a 
            href="#my-nfts" 
            className={`nav-link ${activeTab === 'my-nfts' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-nfts')}
          >
            My NFTs
          </a>
          <a 
            href="#royalties" 
            className={`nav-link ${activeTab === 'royalties' ? 'active' : ''}`}
            onClick={() => setActiveTab('royalties')}
          >
            💰 Royalties
          </a>
        </nav>
        
        <Wallet />
      </header>

      <main>
        <NetworkStatus />
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'mint' && <MintForm />}
        {activeTab === 'my-nfts' && <NFTs />}
        {activeTab === 'royalties' && <RoyaltyDashboard />}
      </main>

      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #333',
        textAlign: 'center',
        color: '#888',
        fontSize: '14px'
      }}>
        <p>NFT Marketplace • Built with React & Hardhat • Supports ERC-721 & ERC-1155</p>
        <p style={{ marginTop: '10px', fontSize: '12px' }}>
          Contract Addresses: 
          <br />
          Marketplace: 0x96D052e194287Ef980D45B43234762C8ADD9c89E
          <br />
          ERC-721: 0xB22679365f71552Fc6448f99891e2e63b04f020E
          <br />
          ERC-1155: 0x36478ed8b1CacC31ca1709b1013688fdB9c7Be7b
        </p>
      </footer>
    </div>
  );
}

export default App;