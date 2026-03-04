// Configuration for frontend
export const CONFIG = {
  network: "localhost",
  contracts: {
    marketplace: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    erc721: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    erc1155: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  },
  networkConfig: {
    chainId: "0x539", // 1337 in hex
    chainName: "Hardhat Local",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  }
};