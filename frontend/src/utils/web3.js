import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, MARKETPLACE_ABI, ERC721_ABI, ERC1155_ABI, NETWORK_CONFIG } from './config';

let provider = null;
let signer = null;
let userAddress = null;

// Contract instances
let marketplaceContract = null;
let erc721Contract = null;
let erc1155Contract = null;

// Get current network
export async function getCurrentNetwork() {
  if (!window.ethereum) return null;
  
  try {
    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    return chainId;
  } catch (error) {
    console.error("Error getting current network:", error);
    return null;
  }
}

// Check if contracts exist on current network
export async function checkContractsExist() {
  try {
    const { marketplace, erc721, erc1155 } = getContracts();
    const currentNetwork = await getCurrentNetwork();
    
    if (!currentNetwork) return false;
    
    // Try to call a simple view function on each contract
    const checks = await Promise.allSettled([
      marketplace.listingCounter(),
      erc721.name(),
      erc1155.name()
    ]);
    
    // If any contract call fails, contracts don't exist on this network
    return checks.every(check => check.status === 'fulfilled');
  } catch (error) {
    console.error("Error checking contracts:", error);
    return false;
  }
}

// Auto-switch to correct network based on contract availability
export async function autoSwitchNetwork() {
  const currentNetwork = await getCurrentNetwork();
  
  if (currentNetwork === NETWORK_CONFIG.localhost.chainId) {
    return { success: true, network: 'localhost' };
  }
  
  if (currentNetwork === NETWORK_CONFIG.sepolia.chainId) {
    return { success: true, network: 'sepolia' };
  }
  
  // Try to detect if we should be on localhost or sepolia
  try {
    const contractsExist = await checkContractsExist();
    if (contractsExist) {
      return { success: true, network: 'current' };
    }
    
    // If contracts don't exist, try switching to localhost first
    try {
      await switchToLocalhost();
      const localhostContractsExist = await checkContractsExist();
      if (localhostContractsExist) {
        return { success: true, network: 'localhost' };
      }
    } catch (error) {
      console.warn("Failed to switch to localhost:", error);
    }
    
    // Try sepolia as fallback
    try {
      await switchToSepolia();
      const sepoliaContractsExist = await checkContractsExist();
      if (sepoliaContractsExist) {
        return { success: true, network: 'sepolia' };
      }
    } catch (error) {
      console.warn("Failed to switch to sepolia:", error);
    }
    
    return { success: false, error: 'Contracts not found on any supported network' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize Web3
export async function initWeb3() {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();
      
      // Initialize contracts
      marketplaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.marketplace,
        MARKETPLACE_ABI,
        signer
      );
      
      erc721Contract = new ethers.Contract(
        CONTRACT_ADDRESSES.erc721,
        ERC721_ABI,
        signer
      );
      
      erc1155Contract = new ethers.Contract(
        CONTRACT_ADDRESSES.erc1155,
        ERC1155_ABI,
        signer
      );
      
      return { provider, signer, userAddress };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask!");
  }
}

// Connect wallet
export async function connectWallet() {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return await initWeb3();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

// Switch to localhost network
export async function switchToLocalhost() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.localhost.chainId }],
    });
  } catch (switchError) {
    // If chain is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG.localhost],
        });
      } catch (addError) {
        throw addError;
      }
    }
    throw switchError;
  }
}

// Switch to Sepolia network
export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }],
    });
  } catch (switchError) {
    // If chain is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG.sepolia],
        });
      } catch (addError) {
        throw addError;
      }
    }
    throw switchError;
  }
}

// Get wallet balance
export async function getBalance() {
  if (!provider || !userAddress) return "0";
  const balance = await provider.getBalance(userAddress);
  return ethers.formatEther(balance);
}

// Get contracts
export function getContracts() {
  if (!erc721Contract || !erc1155Contract || !marketplaceContract) {
    throw new Error("Contracts not initialized. Please connect your wallet first.");
  }
  
  return {
    marketplace: marketplaceContract,
    erc721: erc721Contract,
    erc1155: erc1155Contract
  };
}

// Get current user
export function getUser() {
  if (!provider || !userAddress || !signer) {
    throw new Error("User not initialized. Please connect your wallet first.");
  }
  
  return {
    address: userAddress,
    signer: signer,
    provider: provider
  };
}

// Listen for account changes
export function onAccountsChanged(callback) {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        callback(accounts[0]);
      } else {
        callback(null);
      }
    });
  }
}

// Listen for chain changes
export function onChainChanged(callback) {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }
}