const { ethers } = require("hardhat");

async function main() {
  // Get address from command line or use default
  const targetAddress = process.argv[2] || "0xe1774d01a097e9d2e7142cc978c7f6af9448c495";
  
  try {
    const provider = ethers.provider;
    const balance = await provider.getBalance(targetAddress);
    const network = await provider.getNetwork();

    console.log("=".repeat(60));
    console.log("📊 Wallet Balance Check");
    console.log("=".repeat(60));
    console.log("👤 Address:", targetAddress);
    console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
    console.log("💼 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("\n⚠️  This address has 0 ETH!");
      console.log("\n💡 To fund this address, visit:");
      console.log("   https://sepoliafaucet.com/");
      console.log("   https://faucets.chain.link/sepolia");
      console.log("\n   Paste this address:", targetAddress);
    } else {
      console.log("\n✅ Address has ETH - ready to use!");
    }
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

