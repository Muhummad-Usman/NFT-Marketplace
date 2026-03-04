# NFT Marketplace Frontend

A full-featured NFT marketplace frontend built with React, supporting ERC-721 and ERC-1155 tokens with IPFS integration, multi-media support, and royalty tracking.

## 🚀 Features

### ✅ Core Marketplace Features
- **Multi-Standard Support**: Full support for both ERC-721 (unique) and ERC-1155 (multi-edition) NFTs
- **Decentralized Storage**: IPFS integration through Pinata for permanent file storage
- **Multi-Media NFTs**: Support for images, audio/music, and video files
- **Smart Contract Integration**: Complete marketplace functionality with listing, buying, and selling
- **Royalty System**: Automatic royalty distribution for creators on secondary sales

### 🎨 Media Support
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Audio**: MP3, WAV, OGG, M4A (max 10MB)  
- **Video**: MP4, WebM, OGG (max 50MB)
- **Preview**: Real-time media preview during minting
- **Metadata**: Rich metadata display with attributes and properties

### 💰 Economic Features
- **Royalty Tracking**: Dashboard to track royalty earnings from secondary sales
- **Flexible Pricing**: Set your own prices when listing NFTs
- **Creator Earnings**: Automatic royalty distribution (0-50% configurable)
- **Transaction History**: Complete history of all royalty payments

### 🛠 Technical Features
- **Web3 Integration**: MetaMask wallet connection
- **Multi-Network**: Support for Sepolia testnet and localhost
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live marketplace updates and wallet balance tracking

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Pinata account (for IPFS storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nft-marketplace/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_PINATA_API_KEY=your_pinata_api_key
   REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
   REACT_APP_INFURA_IPFS_PROJECT_ID=your_infura_project_id
   REACT_APP_INFURA_IPFS_PROJECT_SECRET=your_infura_project_secret
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### IPFS Setup (Pinata)
1. Create a free account at [Pinata](https://pinata.cloud)
2. Get your API keys from the Pinata dashboard
3. Add them to your `.env` file

### Smart Contract Addresses
Update the contract addresses in `src/utils/config.js`:
```javascript
export const CONTRACT_ADDRESSES = {
  marketplace: "0x...", // Your marketplace contract
  erc721: "0x...",     // Your ERC-721 contract
  erc1155: "0x..."    // Your ERC-1155 contract
};
```

## 📱 Usage Guide

### Connecting Your Wallet
1. Click the wallet connection button in the header
2. Approve the MetaMask connection
3. Ensure you're on the correct network (Sepolia or localhost)

### Minting an NFT
1. Navigate to the "Mint NFT" tab
2. Choose between ERC-721 (unique) or ERC-1155 (multiple editions)
3. Select media type (Image, Audio, or Video)
4. Upload your media file
5. Fill in NFT details (name, description)
6. Set royalty percentage (0-50%)
7. Click "Mint NFT"

### Listing NFTs for Sale
1. Go to "My NFTs" tab
2. Find the NFT you want to sell
3. Click "List on Marketplace"
4. Set your price in ETH
5. For ERC-1155, specify the amount to sell
6. Confirm the listing

### Buying NFTs
1. Browse the "Marketplace" tab
2. Find an NFT you like
3. Click "Buy Now"
4. Approve the transaction in MetaMask

### Tracking Royalties
1. Visit the "💰 Royalties" tab
2. View your total earnings from secondary sales
3. See transaction history and details

## 🎯 Smart Contract Integration

The frontend integrates with three main contracts:

### Marketplace Contract
- `listToken()`: List NFTs for sale
- `purchaseToken()`: Buy listed NFTs
- `listings()`: View active listings
- Royalty distribution on secondary sales

### ERC-721 Contract
- `safeMint()`: Create unique NFTs
- `tokenURI()`: Get NFT metadata
- `ownerOf()`: Check ownership
- Built-in royalty support (EIP-2981)

### ERC-1155 Contract
- `mint()`: Create multi-edition NFTs
- `uri()`: Get token metadata
- `balanceOf()`: Check token balances
- Batch operations supported

## 🔒 Security Features

- **MetaMask Integration**: Secure wallet connections
- **Contract Verification**: All contract interactions verified
- **Input Validation**: File type and size validation
- **Error Handling**: Comprehensive error messages
- **Transaction Monitoring**: Real-time transaction status

## 🎨 UI/UX Features

- **Dark Theme**: Easy on the eyes design
- **Responsive Layout**: Works on desktop and mobile
- **Loading States**: Clear feedback during operations
- **Media Previews**: See your NFTs before minting
- **Real-time Updates**: Live wallet balance and listings
- **Intuitive Navigation**: Simple tab-based interface

## 📊 File Structure

```
src/
├── components/
│   ├── Wallet.jsx          # Wallet connection
│   ├── MintForm.jsx        # NFT minting interface
│   ├── Marketplace.jsx     # Browse and buy NFTs
│   ├── NFTs.jsx           # User's NFT collection
│   └── RoyaltyDashboard.jsx # Royalty tracking
├── utils/
│   ├── web3.js            # Web3 utilities
│   ├── ipfs.js            # IPFS integration
│   ├── metadata.js        # NFT metadata handling
│   ├── royalties.js       # Royalty calculations
│   └── config.js          # Configuration
├── App.jsx                # Main application
├── styles.css             # Styling
└── index.js              # Entry point
```

## 🚀 Deployment

### Building for Production
```bash
npm run build
```

### Environment Variables for Production
Make sure all environment variables are set in your hosting environment:
- `REACT_APP_PINATA_API_KEY`
- `REACT_APP_PINATA_SECRET_KEY`
- Contract addresses in `config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**MetaMask not connecting**
- Ensure MetaMask is installed and unlocked
- Check you're on the correct network
- Refresh the page and try again

**IPFS upload failing**
- Verify your Pinata API keys are correct
- Check your file size limits
- Ensure proper file formats

**Transactions failing**
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Ensure you're connected to the right network

**NFTs not displaying**
- Wait for metadata to load
- Check IPFS gateway accessibility
- Verify token URI format

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ using React, Ethers.js, and IPFS**
