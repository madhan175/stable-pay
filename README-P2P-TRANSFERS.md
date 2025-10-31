# P2P Transfer Setup Guide

This guide explains how to enable direct wallet-to-wallet USDT transfers between 2 phones using Sepolia testnet.

## Quick Start

### 1. Deploy MockUSDT (One-time setup)

```bash
cd contarcts

# Create .env file with your private key
echo "PRIVATE_KEY=your_private_key_here" > .env

# Deploy MockUSDT
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
```

**After deployment:**
- Copy the USDT address from the output
- Update `src/config/contracts.ts` or set `VITE_USDT_ADDRESS` in `.env`

### 2. Fund Test Wallets

```bash
cd contarcts
npx hardhat run scripts/fund-wallets.js --network sepolia 0xWallet1Address 0xWallet2Address
```

This gives each wallet 1,000 USDT for testing.

### 3. Test on 2 Phones

**Phone 1 (Sender):**
1. Connect MetaMask to Sepolia
2. Open app → Send page
3. Enter amount (e.g., 100)
4. Enter Phone 2's wallet address
5. Click Send → Confirm in MetaMask

**Phone 2 (Receiver):**
1. Connect MetaMask to Sepolia
2. Open app → Receive page
3. View balance - should show incoming USDT
4. Check transaction on Etherscan

## How It Works

- **Direct P2P Transfer**: Uses standard ERC20 `transfer()` function
- **On-Chain Transactions**: All transfers are recorded on Sepolia blockchain
- **Real-Time Updates**: Both phones can see transactions immediately
- **Gas Fees**: Paid in Sepolia ETH (not USDT)

## Configuration

### Option 1: Environment Variable (Recommended)
```env
# Root directory .env file
VITE_USDT_ADDRESS=0xYourDeployedUSDTAddress
```

### Option 2: Direct Code Update
```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  swap: '0x39d886A94568EaDa1e08e4005186F3fff2eE84f9',
  usdt: '0xYourDeployedUSDTAddress',
};
```

## Troubleshooting

### "Insufficient USDT balance"
- Use `fund-wallets.js` to mint USDT to your wallet
- Check balance: Open MetaMask → Import Token → Enter USDT address

### "Contract not found"
- Verify USDT address is correct
- Ensure you're on Sepolia testnet (Chain ID: 11155111)

### "Insufficient funds for gas"
- Get free Sepolia ETH from: https://sepoliafaucet.com/
- Gas is paid in ETH, not USDT

## Files Changed

- ✅ `contarcts/scripts/deploy-mock-usdt.js` - Deployment script
- ✅ `contarcts/scripts/fund-wallets.js` - Wallet funding script  
- ✅ `src/config/contracts.ts` - USDT address configuration
- ✅ `src/pages/Send.tsx` - Direct P2P transfer implementation
- ✅ `contarcts/DEPLOYMENT-INSTRUCTIONS.md` - Detailed deployment guide

## Next Steps

1. Deploy MockUSDT contract
2. Update USDT address in frontend config
3. Fund test wallets
4. Test transfers between 2 phones
5. Verify on Sepolia Etherscan

## Support

For issues or questions:
- Check deployment logs for errors
- Verify network configuration
- Ensure all addresses are checksummed correctly
- Review Sepolia Etherscan for transaction status

