const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Get the contract factory and deployer
  const FiatUSDTSwap = await ethers.getContractFactory("FiatUSDTSwap");
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await ethers.provider.getBalance(deployerAddress);

  console.log("👤 Deployer:", deployerAddress);
  console.log("💼 Balance:", deployerBalance.toString(), "wei");
  if (deployerBalance === 0n) {
    throw new Error("Deployer has 0 balance on target network. Fund it with Sepolia ETH and retry.");
  }
  
  // USDT contract address on Sepolia testnet
  // You can replace this with a mock USDT contract for local testing
  const USDT_ADDRESS = (process.env.USDT_ADDRESS || "0x7169D38820dfe1175ad2e52a4a3c80c2e8f6c1b8"); // Can be overridden via env
  
  // For local testing, we'll use a mock USDT address
  const MOCK_USDT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Mock address for local (will be checksummed)
  
  // Use mock address for local testing
  // Normalize and checksum the address to satisfy ethers v6 validation
  const rawAddress = network.name === "localhost" ? MOCK_USDT_ADDRESS : USDT_ADDRESS;
  const usdtAddress = ethers.getAddress(rawAddress.toLowerCase());
  
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
  console.log("=".repeat(50));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  console.log("=".repeat(50));
  
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
