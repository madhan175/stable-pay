const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();

  console.log("=".repeat(60));
  console.log("📊 Wallet Balance Check");
  console.log("=".repeat(60));
  console.log("👤 Wallet Address:", deployerAddress);
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log("💼 Balance:", ethers.formatEther(deployerBalance), "ETH");
  
  if (deployerBalance === 0n) {
    console.log("\n⚠️  WARNING: Your wallet has 0 ETH!");
    console.log("\n💡 To get Sepolia testnet ETH, visit one of these faucets:");
    console.log("\n   1. Alchemy Sepolia Faucet:");
    console.log("      https://sepoliafaucet.com/");
    console.log("\n   2. Infura Sepolia Faucet:");
    console.log("      https://www.infura.io/faucet/sepolia");
    console.log("\n   3. QuickNode Sepolia Faucet:");
    console.log("      https://faucet.quicknode.com/ethereum/sepolia");
    console.log("\n   4. Chainlink Sepolia Faucet:");
    console.log("      https://faucets.chain.link/sepolia");
    console.log("\n   📋 Copy your wallet address above and paste it into the faucet.");
    console.log("   ⏱️  Wait a few minutes for the transaction to confirm.");
    console.log("   🔄 Then run this script again to verify your balance.");
  } else {
    const minBalance = ethers.parseEther("0.01"); // 0.01 ETH minimum recommended
    if (deployerBalance < minBalance) {
      console.log("\n⚠️  Low balance! You may want more ETH for deployments.");
      console.log("   Recommended: At least 0.01 ETH for smooth deployments.");
    } else {
      console.log("\n✅ Sufficient balance for deployment!");
    }
  }
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

