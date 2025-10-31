const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying MockUSDT to Sepolia...");

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await ethers.provider.getBalance(deployerAddress);
  
  console.log("👤 Deployer:", deployerAddress);
  console.log("💼 Balance:", ethers.formatEther(deployerBalance), "ETH");
  
  // Check if using wrong wallet (address that has ETH)
  const fundedAddress = "0xe1774d01a097e9d2e7142cc978c7f6af9448c495";
  if (deployerBalance === 0n && deployerAddress.toLowerCase() !== fundedAddress.toLowerCase()) {
    console.log("\n⚠️  Your current wallet has 0 ETH!");
    console.log("💡 You have a wallet with ETH: " + fundedAddress);
    console.log("\n📋 To fix this:");
    console.log("   1. Get the private key for address: " + fundedAddress);
    console.log("   2. Create/update contarcts/.env file with:");
    console.log("      PRIVATE_KEY=your_private_key_here");
    console.log("   3. Or run: node setup-env.js");
    console.log("\n   See SETUP-WALLET.md for detailed instructions.");
    throw new Error("Deployer has 0 balance. Update PRIVATE_KEY in .env to use the funded wallet.");
  }
  
  if (deployerBalance === 0n) {
    throw new Error("Deployer has 0 balance. Fund it with Sepolia ETH from https://sepoliafaucet.com/");
  }

  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  console.log("📝 Deploying MockUSDT contract...");
  
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();

  const usdtAddress = await usdt.getAddress();
  console.log("✅ MockUSDT deployed at:", usdtAddress);

  // Mint some USDT to deployer for testing
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
  console.log("💰 Minting 10,000 USDT to deployer...");
  await usdt.mint(deployerAddress, mintAmount);
  
  const balance = await usdt.balanceOf(deployerAddress);
  console.log("✅ Minted! Deployer balance:", ethers.formatUnits(balance, 6), "USDT");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    usdtAddress: usdtAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    deployer: deployerAddress,
    note: "MockUSDT for P2P transfers on Sepolia testnet"
  };
  
  const outputPath = './usdt-deployment.json';
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to", outputPath);
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`USDT Address: ${usdtAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  console.log("=".repeat(50));
  console.log("\n✨ Next steps:");
  console.log("1. Update src/config/contracts.ts with this USDT address");
  console.log("2. Update contarcts/deployment.json with this USDT address");
  console.log("3. Mint USDT to test wallets using fund-wallets.js script");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
