const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
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

