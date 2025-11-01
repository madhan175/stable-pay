const { ethers } = require("hardhat");
const deploymentData = require("../deployment.json");

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const network = await ethers.provider.getNetwork();

  console.log("=".repeat(60));
  console.log("📝 Update INR Exchange Rate");
  console.log("=".repeat(60));
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log("👤 Wallet Address:", deployerAddress);
  console.log("📄 Contract Address:", deploymentData.contractAddress);
  
  // Load the contract
  const contractABI = [
    "function updateCurrency(string memory currency, uint256 rate, bool supported)",
    "function currencyRates(string memory currency) view returns (uint256)",
    "function admin() view returns (address)"
  ];
  
  const contract = new ethers.Contract(
    deploymentData.contractAddress,
    contractABI,
    deployer
  );
  
  // Verify deployer is admin
  const adminAddress = await contract.admin();
  if (adminAddress.toLowerCase() !== deployerAddress.toLowerCase()) {
    console.log("\n❌ ERROR: You are not the admin!");
    console.log("   Expected admin:", adminAddress);
    console.log("   Your address:", deployerAddress);
    process.exit(1);
  }
  
  console.log("✅ Verified: You are the admin");
  
  // Current rate
  const currentRate = await contract.currencyRates("INR");
  console.log("\n📊 Current INR Rate:", ethers.formatUnits(currentRate, 8), "USD per INR");
  
  // New rate: 1 USD = 88.78 INR
  // So 1 INR = 1/88.78 USD = 0.01126379815... USD
  // Rate is stored as: how many USD = 1 of this currency
  // So INR rate = (1 / 88.78) * 1e8 = 1,126,380 (rounded)
  const newRateStr = "0.01126380"; // 1 INR = 0.01126380 USD
  const newRate = ethers.parseUnits(newRateStr, 8);
  
  console.log("📝 New INR Rate:", newRateStr, "USD per INR");
  console.log("📝 Raw Rate Value:", newRate.toString());
  
  if (currentRate.toString() === newRate.toString()) {
    console.log("\n⚠️  Rate is already set to this value!");
    process.exit(0);
  }
  
  console.log("\n🚀 Updating INR rate...");
  const tx = await contract.updateCurrency("INR", newRate, true);
  console.log("📤 Transaction hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  // Verify the update
  const updatedRate = await contract.currencyRates("INR");
  console.log("\n📊 Updated INR Rate:", ethers.formatUnits(updatedRate, 8), "USD per INR");
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ INR rate updated successfully!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

