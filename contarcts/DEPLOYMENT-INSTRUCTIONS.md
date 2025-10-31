# Deployment Instructions for P2P Transfers

This guide will help you deploy MockUSDT on Sepolia testnet and enable P2P transfers between wallets.

## Prerequisites

1. **MetaMask wallet** with Sepolia ETH for gas fees
   - Get free Sepolia ETH from: https://sepoliafaucet.com/
   
2. **Private Key** from your deployer wallet (for contract deployment)

3. **Infura/Alchemy RPC URL** (optional, uses default if not provided)

## Step 1: Set Up Environment Variables

Create a `.env` file in the `contarcts/` directory:

```env
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# Or use default: https://sepolia.infura.io/v3/1d14a9defd94468f80e4a1682c47e275
```

**⚠️ IMPORTANT:** Never commit your private key to git! Add `.env` to `.gitignore`.

## Step 2: Deploy MockUSDT Contract

```bash
cd contarcts
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
```

This will:
- Deploy MockUSDT contract to Sepolia
- Mint 10,000 USDT to your deployer address
- Save deployment info to `usdt-deployment.json`

**Note the USDT address** from the output - you'll need it in the next step.

## Step 3: Update Frontend Configuration

After deployment, update the USDT address in your frontend:

### Option A: Environment Variable (Recommended)
Create a `.env` file in the root directory:
```env
VITE_USDT_ADDRESS=0xYourDeployedUSDTAddressHere
```

### Option B: Direct Code Update
Update `src/config/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  swap: '0xA59CE17F2ea6946F48386B4bD7884512AeC674F4',
  usdt: '0xYourDeployedUSDTAddressHere', // ← Update this
};
```

### Update Backend Deployment Info
Update `contarcts/deployment.json`:
```json
{
  "contractAddress": "0xA59CE17F2ea6946F48386B4bD7884512AeC674F4",
  "usdtAddress": "0xYourDeployedUSDTAddressHere",
  ...
}
```

## Step 4: Fund Test Wallets with USDT

Use the fund script to mint USDT to your test wallets:

```bash
cd contarcts
npx hardhat run scripts/fund-wallets.js --network sepolia 0xWallet1Address 0xWallet2Address
```

This will mint 1,000 USDT to each wallet address you provide.

## Step 5: Test P2P Transfers

1. **On Phone 1 (Sender):**
   - Connect MetaMask to Sepolia testnet
   - Open the Send page in your app
   - Enter amount and Phone 2's wallet address
   - Click Send

2. **On Phone 2 (Receiver):**
   - Connect MetaMask to Sepolia testnet  
   - Open the Receive page
   - Check balance - should show incoming USDT
   - View transaction on Sepolia Etherscan

## Verification

Check your transactions on:
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- Search by wallet address or transaction hash

## Troubleshooting

### "Insufficient USDT balance"
- Fund the wallet using the `fund-wallets.js` script
- Check balance using MetaMask or Etherscan

### "Contract not deployed"
- Ensure you've deployed MockUSDT and updated the address
- Check that you're on Sepolia testnet (Chain ID: 11155111)

### "Insufficient funds for gas"
- Get Sepolia ETH from a faucet
- You need ETH to pay for gas fees, not USDT

## Contract Addresses Reference

After deployment, your setup should have:
- **Swap Contract**: `0xA59CE17F2ea6946F48386B4bD7884512AeC674F4` (already deployed)
- **MockUSDT**: `0xYourDeployedAddress` (deploy in Step 2)

## Notes

- MockUSDT has 6 decimals (like real USDT)
- Default mint amount is 10,000 USDT to deployer
- Each test wallet gets 1,000 USDT when using fund script
- All transactions are on Sepolia testnet (test tokens only)

