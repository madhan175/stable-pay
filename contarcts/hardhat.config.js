require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/1d14a9defd94468f80e4a1682c47e275",
      accounts: (() => {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey || !privateKey.trim()) {
          return undefined; // No private key set, allow scripts to work without it
        }
        const cleanedKey = privateKey.trim().replace(/^0x/, '');
        if (cleanedKey.length !== 64) {
          console.warn(`⚠️  Warning: PRIVATE_KEY appears invalid (expected 64 hex chars, got ${cleanedKey.length}). Scripts may fail.`);
          return undefined; // Invalid key, return undefined to prevent Hardhat error
        }
        return cleanedKey.startsWith('0x') ? [cleanedKey] : [`0x${cleanedKey}`];
      })(),
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
