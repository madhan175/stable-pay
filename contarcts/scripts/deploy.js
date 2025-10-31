const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Get the contract factory and deployer
  const FiatUSDTSwap = await ethers.getContractFactory("FiatUSDTSwap");
  
  let deployer;
  let deployerAddress;
  let deployerBalance;
  
  try {
    const signers = await ethers.getSigners();
    if (!signers || signers.length === 0) {
      throw new Error("No signers available");
    }
    deployer = signers[0];
    if (!deployer) {
      throw new Error("Deployer signer is undefined");
    }
    deployerAddress = await deployer.getAddress();
    deployerBalance = await ethers.provider.getBalance(deployerAddress);
  } catch (error) {
    console.error("❌ Error getting deployer signer:", error.message);
    console.log("\n💡 This usually means PRIVATE_KEY is not set or invalid in .env file.");
    console.log("\n📝 To fix this:");
    console.log("   1. Open contarcts/.env file");
    console.log("   2. Set PRIVATE_KEY=your_64_character_hex_private_key");
    console.log("   3. Make sure to remove any '0x' prefix from the private key");
    console.log("   4. The private key should be exactly 64 hex characters (0-9, a-f)");
    console.log("   5. Example: PRIVATE_KEY=abc123def4567890123456789012345678901234567890123456789012345678");
    process.exit(1);
  }

  console.log("👤 Deployer:", deployerAddress);
  console.log("💼 Balance:", deployerBalance.toString(), "wei");
  if (deployerBalance === 0n) {
    throw new Error("Deployer has 0 balance on target network. Fund it with Sepolia ETH and retry.");
  }
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  
  // USDT contract address on Sepolia testnet
  // You can replace this with a mock USDT contract for local testing
  const USDT_ADDRESS = (process.env.USDT_ADDRESS || "0x1234567890123456789012345678901234567890"); // Can be overridden via env
  
  // For local testing, we'll use a mock USDT address
  const MOCK_USDT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Mock address for local (will be checksummed)
  
  // Use mock address for local testing
  // Normalize and checksum the address to satisfy ethers v6 validation
  const networkName = network.name || "unknown";
  const rawAddress = networkName === "localhost" || network.chainId === 31337n ? MOCK_USDT_ADDRESS : USDT_ADDRESS;
  const usdtAddress = ethers.getAddress(rawAddress.toLowerCase());
  
  console.log("📝 Deploying FiatUSDTSwap contract...");
  console.log("💰 USDT Address:", usdtAddress);
  console.log("🌐 Network:", networkName, `(Chain ID: ${network.chainId})`);
  
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
  
  const blockNumber = await ethers.provider.getBlockNumber();
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Block Number: ${blockNumber}`);
  console.log("=".repeat(50));
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    usdtAddress: usdtAddress,
    admin: await swapContract.admin(),
    network: networkName,
    chainId: network.chainId.toString(),
    blockNumber: blockNumber,
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
