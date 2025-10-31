const { ethers } = require("hardhat");

async function main() {
  let deployer;
  try {
    [deployer] = await ethers.getSigners();
  } catch (error) {
    console.error("❌ Error getting signers:", error.message);
    console.log("\n💡 This usually means PRIVATE_KEY is not set or invalid in .env file.");
    console.log("\n📝 To fix this:");
    console.log("   1. Open contarcts/.env file");
    console.log("   2. Set PRIVATE_KEY=your_64_character_hex_private_key");
    console.log("   3. Make sure to remove any '0x' prefix from the private key");
    console.log("   4. The private key should be exactly 64 hex characters");
    process.exit(1);
  }
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();

  console.log("=".repeat(60));
  console.log("📊 Wallet Information");
  console.log("=".repeat(60));
  console.log("👤 Current Wallet Address:", deployerAddress);
  console.log("💼 Balance:", ethers.formatEther(deployerBalance), "ETH");
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  
  const targetAddress = "0xe1774d01a097e9d2e7142cc978c7f6af9448c495";
  const isTarget = deployerAddress.toLowerCase() === targetAddress.toLowerCase();
  
  console.log("\n🎯 Target Address:", targetAddress);
  if (isTarget) {
    console.log("✅ Current wallet matches target address!");
  } else {
    console.log("⚠️  Current wallet DOES NOT match target address!");
    console.log("\n💡 To use the target address, update your .env file:");
    console.log("   1. Get the private key for address:", targetAddress);
    console.log("   2. Update PRIVATE_KEY in contarcts/.env");
    console.log("   3. Make sure you don't include '0x' prefix in PRIVATE_KEY");
  }
  
  if (deployerBalance === 0n) {
    console.log("\n⚠️  WARNING: Your wallet has 0 ETH!");
    console.log("\n💡 Get Sepolia ETH from a faucet:");
    console.log("   https://sepoliafaucet.com/");
    console.log("   https://faucets.chain.link/sepolia");
    console.log("\n   Address to fund:", isTarget ? deployerAddress : targetAddress);
  } else {
    console.log("\n✅ Wallet has ETH - ready to deploy!");
  }
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

