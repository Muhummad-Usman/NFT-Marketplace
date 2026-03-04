import { ethers } from 'ethers';

// Calculate royalty amount from sale price
export function calculateRoyalty(salePriceWei, royaltyBasisPoints) {
  const salePrice = ethers.getBigInt(salePriceWei);
  const royaltyFraction = ethers.getBigInt(royaltyBasisPoints);
  const basisPoints = ethers.getBigInt(10000);
  
  const royaltyAmount = (salePrice * royaltyFraction) / basisPoints;
  return royaltyAmount.toString();
}

// Format royalty percentage from basis points
export function formatRoyaltyPercentage(royaltyBasisPoints) {
  const percentage = (parseInt(royaltyBasisPoints) / 100).toFixed(2);
  return `${percentage}%`;
}

// Get royalty info for an NFT
export async function getNFTRoyaltyInfo(tokenAddress, tokenId, isERC1155 = false) {
  try {
    // Import getContracts dynamically to avoid circular dependency
    const { getContracts } = await import('./web3');
    const { erc721, erc1155 } = getContracts();
    
    let royaltyInfo = { recipient: '0x0000000000000000000000000000000000000000', royaltyBps: '0' };
    
    if (isERC1155) {
      // For ERC1155, you might need to implement a function to get royalty info
      // This is a placeholder - actual implementation depends on your contract
      try {
        royaltyInfo = await erc1155.royaltyInfo(tokenId, ethers.parseEther('1'));
      } catch (error) {
        console.warn('Royalty info not available for ERC1155 token');
      }
    } else {
      // For ERC721
      try {
        royaltyInfo = await erc721.royaltyInfo(tokenId, ethers.parseEther('1'));
      } catch (error) {
        console.warn('Royalty info not available for ERC721 token');
      }
    }
    
    return {
      success: true,
      recipient: royaltyInfo.recipient,
      royaltyBps: royaltyInfo.royaltyBps.toString(),
      formattedPercentage: formatRoyaltyPercentage(royaltyInfo.royaltyBps.toString())
    };
  } catch (error) {
    console.error('Error getting royalty info:', error);
    return {
      success: false,
      error: error.message,
      recipient: '0x0000000000000000000000000000000000000000',
      royaltyBps: '0',
      formattedPercentage: '0%'
    };
  }
}

// Track royalty earnings for a creator
export class RoyaltyTracker {
  constructor() {
    this.earnings = {};
    this.loadFromStorage();
  }

  // Add royalty earning
  addEarning(creatorAddress, tokenId, salePrice, royaltyAmount, timestamp = Date.now()) {
    const key = creatorAddress.toLowerCase();
    
    if (!this.earnings[key]) {
      this.earnings[key] = {
        totalEarned: '0',
        transactions: []
      };
    }
    
    this.earnings[key].totalEarned = (
      ethers.getBigInt(this.earnings[key].totalEarned) + ethers.getBigInt(royaltyAmount)
    ).toString();
    
    this.earnings[key].transactions.push({
      tokenId,
      salePrice,
      royaltyAmount,
      timestamp,
      formattedDate: new Date(timestamp).toLocaleString()
    });
    
    this.saveToStorage();
  }

  // Get total earnings for a creator
  getTotalEarnings(creatorAddress) {
    const key = creatorAddress.toLowerCase();
    return this.earnings[key]?.totalEarned || '0';
  }

  // Get transaction history for a creator
  getTransactionHistory(creatorAddress) {
    const key = creatorAddress.toLowerCase();
    return this.earnings[key]?.transactions || [];
  }

  // Get formatted earnings in ETH
  getFormattedEarnings(creatorAddress) {
    const totalWei = this.getTotalEarnings(creatorAddress);
    return ethers.formatEther(totalWei);
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('nft-royalty-earnings', JSON.stringify(this.earnings));
    } catch (error) {
      console.error('Error saving royalty data:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('nft-royalty-earnings');
      if (stored) {
        this.earnings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading royalty data:', error);
    }
  }

  // Clear all data
  clearData() {
    this.earnings = {};
    localStorage.removeItem('nft-royalty-earnings');
  }
}

// Create global royalty tracker instance
export const royaltyTracker = new RoyaltyTracker();

// Calculate platform fee
export function calculatePlatformFee(salePriceWei, platformFeeBps = '250') { // 2.5% default
  const salePrice = ethers.getBigInt(salePriceWei);
  const feeFraction = ethers.getBigInt(platformFeeBps);
  const basisPoints = ethers.getBigInt(10000);
  
  const platformFee = (salePrice * feeFraction) / basisPoints;
  return platformFee.toString();
}

// Get net amount after fees and royalties
export function calculateNetAmount(salePriceWei, royaltyBps, platformFeeBps = '250') {
  const salePrice = ethers.getBigInt(salePriceWei);
  const royaltyAmount = ethers.getBigInt(calculateRoyalty(salePriceWei, royaltyBps));
  const platformFee = ethers.getBigInt(calculatePlatformFee(salePriceWei, platformFeeBps));
  
  const netAmount = salePrice - royaltyAmount - platformFee;
  return netAmount.toString();
}

// Format breakdown of sale proceeds
export function formatSaleBreakdown(salePriceWei, royaltyBps, platformFeeBps = '250') {
  const salePrice = ethers.formatEther(salePriceWei);
  const royaltyAmount = ethers.formatEther(calculateRoyalty(salePriceWei, royaltyBps));
  const platformFee = ethers.formatEther(calculatePlatformFee(salePriceWei, platformFeeBps));
  const netAmount = ethers.formatEther(calculateNetAmount(salePriceWei, royaltyBps, platformFeeBps));
  
  return {
    salePrice: `${salePrice} ETH`,
    royalty: `${royaltyAmount} ETH (${formatRoyaltyPercentage(royaltyBps)})`,
    platformFee: `${platformFee} ETH (${(parseInt(platformFeeBps) / 100).toFixed(2)}%)`,
    netToSeller: `${netAmount} ETH`,
    breakdown: {
      total: parseFloat(salePrice),
      royalty: parseFloat(royaltyAmount),
      platform: parseFloat(platformFee),
      seller: parseFloat(netAmount)
    }
  };
}
