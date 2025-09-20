const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Get the contract factory
  const FiatUSDTSwap = await ethers.getContractFactory("FiatUSDTSwap");
  
  // USDT contract address on Sepolia testnet
  // You can replace this with a mock USDT contract for local testing
  const USDT_ADDRESS = "0x7169D38820dfe1175Ad2E52A4A3c80C2E8f6C1b8"; // Real USDT on Sepolia
  
  // For local testing, we'll use a mock USDT address
  const MOCK_USDT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Mock address for local
  
  // Use mock address for local testing
  const usdtAddress = network.name === "localhost" ? MOCK_USDT_ADDRESS : USDT_ADDRESS;
  
  console.log("📝 Deploying FiatUSDTSwap contract...");
  console.log("💰 USDT Address:", usdtAddress);
  console.log("🌐 Network:", network.name);
  
  // Deploy the contract
  const swapContract = await FiatUSDTSwap.deploy(usdtAddress);
  await swapContract.waitForDeployment();
  
  const contractAddress = await swapContract.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", await swapContract.admin());
  console.log("💰 USDT Token:", await swapContract.usdt());
  console.log("📊 GST Rate:", await swapContract.GST_RATE());
  
  // Display supported currencies
  console.log("\n🌍 Supported Currencies:");
  const currencies = ["USDT", "INR", "EUR", "USD"];
  for (const currency of currencies) {
    const isSupported = await swapContract.isCurrencySupported(currency);
    const rate = await swapContract.currencyRates(currency);
    console.log(`  ${currency}: ${isSupported ? '✅' : '❌'} (Rate: ${rate.toString()})`);
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  console.log("=" .repeat(50));
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    usdtAddress: usdtAddress,
    admin: await swapContract.admin(),
    network: network.name,
    chainId: network.config.chainId,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };
  
  console.log("\n💾 Deployment info saved to deployment.json");
  require('fs').writeFileSync(
    './deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
