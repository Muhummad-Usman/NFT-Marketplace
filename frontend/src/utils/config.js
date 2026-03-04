// Remove Pinata API keys, keep only JWT
export const IPFS_CONFIG = {
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  pinataJWT: process.env.REACT_APP_PINATA_JWT, // Only JWT needed
  maxFileSize: 52428800, // 50MB
  supportedFormats: [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 
    'audio/mpeg', 'audio/wav',
    'application/json'
  ]
};

// Cache-busting version - force refresh
export const CONFIG_VERSION = '1.1.0-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

// Contract addresses
export const CONTRACT_ADDRESSES = {
  marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS || '0x96D052e194287Ef980D45B43234762C8ADD9c89E',
  erc721: process.env.REACT_APP_ERC721_ADDRESS || '0xB22679365f71552Fc6448f99891e2e63b04f020E',
  erc1155: process.env.REACT_APP_ERC1155_ADDRESS || '0x36478ed8b1CacC31ca1709b1013688fdB9c7Be7b'
};

// Network configuration
export const NETWORK_CONFIG = {
  localhost: {
    chainId: '0x7e6', // 31337 in hex
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545/'],
    blockExplorerUrls: [],
  },
  sepolia: {
    chainId: '0xaa36a7', // Sepolia testnet
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

// Contract ABIs
export const MARKETPLACE_ABI = [
  "function listToken(address tokenAddress, uint256 tokenId, uint256 priceWei, uint256 amount, bool isERC1155) external",
  "function buyToken(uint256 listingId) external payable",
  "function purchaseToken(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function getListing(uint256 listingId) external view returns (address seller, address tokenAddress, uint256 tokenId, uint256 priceWei, uint256 amount, bool isERC1155, bool isActive)",
  "function getAllListings() external view returns (tuple(address seller, address tokenAddress, uint256 tokenId, uint256 priceWei, uint256 amount, bool isERC1155, bool isActive)[])",
  "function getListingsByToken(address tokenAddress, uint256 tokenId) external view returns (uint256[])",
  "function listingCounter() external view returns (uint256)",
  "function listings(uint256 listingId) external view returns (address seller, address tokenAddress, uint256 tokenId, uint256 price, uint256 amount, bool isERC1155, bool active)"
];

export const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function safeMint(address to, string uri, address royaltyRecipient, uint96 royaltyFraction) returns (uint256)"
];

export const ERC1155_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",
  "function uri(uint256 id) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function mint(address account, uint256 amount, string tokenURI, address royaltyRecipient, uint96 royaltyFraction, bytes data) returns (uint256)"
];