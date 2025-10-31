# Quick Fix: Set Up .env File

Your wallet `0xe1774d01a097e9d2e7142cc978c7f6af9448c495` has ETH, but Hardhat is using a different wallet.

## Option 1: Interactive Setup (Recommended)

Run this helper script:
```bash
cd contarcts
node setup-env.js
```

It will prompt you for your private key and create the `.env` file.

## Option 2: Manual Setup

1. **Create `.env` file** in the `contarcts` directory:
   ```bash
   cd contarcts
   copy .env.template .env
   ```

2. **Get your private key** for address `0xe1774d01a097e9d2e7142cc978c7f6af9448c495`:
   - If using MetaMask: Settings → Security & Privacy → Show Private Key
   - **⚠️ NEVER share your private key!**

3. **Edit `.env` file** and replace `PASTE_YOUR_PRIVATE_KEY_FOR_0xe1774d01a097e9d2e7142cc978c7f6af9448c495_HERE` with your actual private key
   - Remove `0x` prefix if it exists
   - Don't use quotes
   
   Example:
   ```
   PRIVATE_KEY=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef
   ```

4. **Verify it works**:
   ```bash
   npx hardhat run scripts/check-address.js --network sepolia
   ```
   
   Should show: `✅ Current wallet matches target address!`

5. **Deploy**:
   ```bash
   npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
   ```

## Security ⚠️

- **NEVER commit `.env` to git!**
- Make sure `.gitignore` includes `.env`
- Keep your private key secret

