import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    /** Telcoin Network mainnet — chainId 2017 (confirm before mainnet deploy). */
    telcoin: {
      url: process.env.TELCOIN_RPC_URL || "https://rpc.telcoin.network",
      chainId: Number(process.env.TELCOIN_CHAIN_ID || 2017),
      accounts,
    },
    telcoinTestnet: {
      url: process.env.TELCOIN_TESTNET_RPC_URL || "https://rpc.testnet.telcoin.network",
      chainId: Number(process.env.TELCOIN_TESTNET_CHAIN_ID || 2018),
      accounts,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      chainId: 137,
      accounts,
    },
  },
};

export default config;
