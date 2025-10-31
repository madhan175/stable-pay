# Setup Wallet for Deployment

## Your Target Wallet Address
**Address:** `0xe1774d01a097e9d2e7142cc978c7f6af9448c495`  
**Balance:** 0.05 ETH ✅ (Sufficient for deployment)

## Step 1: Create/Update .env File

In the `contarcts` directory, create or update `.env` file:

```bash
# Copy from env.example if it doesn't exist
cp env.example .env
```

## Step 2: Add Your Private Key

1. Get the **private key** for address `0xe1774d01a097e9d2e7142cc978c7f6af9448c495`
   - If you have this wallet in MetaMask: Export private key from MetaMask
   - If you have the mnemonic: Derive the private key
   - **⚠️ NEVER share your private key publicly!**

2. Update `contarcts/.env` file:
   ```env
   PRIVATE_KEY=your_private_key_here_without_0x_prefix
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ```

   Example:
   ```env
   PRIVATE_KEY=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/1d14a9defd94468f80e4a1682c47e275
   ```

   **Important:** 
   - Don't include `0x` prefix
   - Don't include quotes
   - Keep this file secret (add to `.gitignore`)

## Step 3: Verify Configuration

Run this to verify your wallet is configured correctly:

```bash
cd contarcts
npx hardhat run scripts/check-address.js --network sepolia
```

It should show that your current wallet matches the target address.

## Step 4: Deploy MockUSDT

Once configured, deploy:

```bash
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
```

## Security Notes

⚠️ **NEVER commit your `.env` file to git!**

Make sure `.env` is in `.gitignore`:
```
.env
.env.local
*.env
```

