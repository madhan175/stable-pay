const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("💰 Funding wallets with MockUSDT...");

  // Read USDT deployment info
  let usdtAddress;
  try {
    const usdtDeployment = JSON.parse(fs.readFileSync('./usdt-deployment.json', 'utf8'));
    usdtAddress = usdtDeployment.usdtAddress;
    console.log("📖 Using USDT address from usdt-deployment.json:", usdtAddress);
  } catch (error) {
    // Try to get from env or use default
    usdtAddress = process.env.USDT_ADDRESS;
    if (!usdtAddress) {
      throw new Error("USDT address not found. Please deploy MockUSDT first or set USDT_ADDRESS env variable.");
    }
    console.log("📖 Using USDT address from env:", usdtAddress);
  }

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("👤 Deployer:", deployerAddress);

  // Get wallet addresses from command line or env
  const walletAddresses = process.argv.slice(2);
  
  if (walletAddresses.length === 0) {
    console.log("\n⚠️  No wallet addresses provided!");
    console.log("Usage: npx hardhat run scripts/fund-wallets.js --network sepolia <wallet1> <wallet2> ...");
    console.log("Example: npx hardhat run scripts/fund-wallets.js --network sepolia 0x1234... 0x5678...");
    process.exit(1);
  }

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = MockUSDT.attach(usdtAddress);

  const mintAmount = ethers.parseUnits("1000", 6); // 1,000 USDT per wallet

  console.log(`\n📝 Minting ${ethers.formatUnits(mintAmount, 6)} USDT to each wallet...\n`);

  for (const walletAddress of walletAddresses) {
    try {
      // Validate address
      ethers.getAddress(walletAddress); // Will throw if invalid
      
      console.log(`💰 Minting to ${walletAddress}...`);
      const tx = await usdt.mint(walletAddress, mintAmount);
      await tx.wait();
      
      const balance = await usdt.balanceOf(walletAddress);
      console.log(`✅ Done! Balance: ${ethers.formatUnits(balance, 6)} USDT\n`);
    } catch (error) {
      console.error(`❌ Failed to fund ${walletAddress}:`, error.message);
    }
  }

  console.log("✨ All wallets funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  });

