# How to Get Your Private Key for Contract Deployment

## Step 1: Get Your MetaMask Private Key

You need the private key from your MetaMask wallet to deploy contracts. Here's how to get it:

### Option A: From MetaMask Extension (Desktop)

1. Open MetaMask and click on your account icon (circle at top right)
2. Click **"Account Details"**
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key (it will be a long string starting with `0x`)
6. **Important:** Store this securely and never share it!

### Option B: From MetaMask Mobile

1. Open MetaMask app
2. Tap the menu (☰) in top left
3. Go to **"Settings"**
4. Tap **"Security & Privacy"**
5. Tap **"Show Private Key"**
6. Enter your password/biometric
7. Copy the private key

## Step 2: Prepare Your Private Key

Your private key should look like this:
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Important:** 
- The full private key is **66 characters** (including `0x`)
- For the `.env` file, you should **remove the `0x` prefix**
- The key should be **64 hex characters** (0-9, a-f)

Example:
- **Raw from MetaMask:** `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- **For .env file:** `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

## Step 3: Create Your .env File

1. Navigate to the `contarcts` folder in your terminal:
   ```bash
   cd contarcts
   ```

2. Copy the example env file:
   ```bash
   cp env.example .env
   ```

3. Edit the `.env` file and replace the placeholder with your private key:
   ```env
   # Sepolia Testnet Configuration
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   
   # Contract Addresses (will be filled after deployment)
   CONTRACT_ADDRESS=
   USDT_ADDRESS=
   ```

4. **Optionally** update the RPC URL (or leave as default)

## Step 4: Verify Your Setup

Run this command to check if your private key is configured correctly:
```bash
npm run deploy:sepolia
```

If you see your wallet address and balance, it's working! 🎉

## Security Warnings ⚠️

1. **NEVER** share your private key with anyone
2. **NEVER** commit your `.env` file to git
3. **NEVER** use your mainnet private key for testing
4. Use a **test wallet** for Sepolia deployments (not your main wallet)
5. The `.env` file is already in `.gitignore` - make sure it stays there!

## Troubleshooting

### Error: "PRIVATE_KEY appears invalid (expected 64 hex chars, got 40)"
- Make sure you removed the `0x` prefix
- The key should be exactly 64 characters (no spaces)

### Error: "No signers available"
- Check that your `.env` file exists in `contarcts/` folder
- Verify the `PRIVATE_KEY` line has no extra spaces or quotes
- Restart your terminal after creating `.env`

### Error: "Deployer has 0 balance"
- You need Sepolia testnet ETH for gas fees
- Get free Sepolia ETH from: https://sepoliafaucet.com/
- Send it to the wallet address associated with your private key

### Create a New Test Wallet
If you don't want to use your existing MetaMask wallet:
1. Create a new account in MetaMask
2. Switch to Sepolia testnet
3. Get Sepolia ETH from a faucet
4. Export the private key for that account
5. Use that private key in your `.env` file

## Next Steps

Once your `.env` is set up:
1. Deploy MockUSDT: `npm run deploy:sepolia` (if not already deployed)
2. Deploy Swap contract: `npm run deploy:sepolia` (if needed)
3. Update frontend with deployed addresses
4. Start testing!

