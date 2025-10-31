# How to Fund Your Wallet with MockUSDT

Your MockUSDT is deployed at: `0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD`

## Get Your MetaMask Wallet Address

1. Open MetaMask
2. Make sure you're on **Sepolia testnet**
3. Click on your account name at the top
4. Click to **copy your wallet address** (it starts with `0x`)

## Fund Your Wallet

Run this command with **YOUR wallet address**:

```bash
cd contarcts
npx hardhat run scripts/fund-wallets.js --network sepolia YOUR_WALLET_ADDRESS_HERE
```

**Example:**
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

This will:
- ✅ Mint 1,000 USDT to your wallet
- ✅ Show your balance
- ✅ Confirm the transaction

## Verify Your Balance

### Option 1: In MetaMask
1. Open MetaMask on Sepolia testnet
2. Click "Import tokens"
3. Add token address: `0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD`
4. Click "Add custom token"
5. Your USDT balance should appear!

### Option 2: On Etherscan
Visit: https://sepolia.etherscan.io/address/0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD

## Troubleshooting

### Error: "PRIVATE_KEY not set"
You need to set up your `.env` file first:
1. Copy `env.example` to `.env`: `cp env.example .env`
2. Add your private key (without `0x` prefix)
3. See `GET-PRIVATE-KEY.md` for instructions

### Error: "Insufficient funds for gas"
Your deployer wallet needs Sepolia ETH for gas fees:
- Get free Sepolia ETH from: https://sepoliafaucet.com/
- Send it to your deployer wallet

### I want to fund multiple wallets
Add multiple addresses to the command:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xWallet1 0xWallet2 0xWallet3
```

### I want more than 1,000 USDT
Edit `fund-wallets.js` line 40:
```javascript
const mintAmount = ethers.parseUnits("5000", 6); // 5,000 USDT
```

## Next Steps

Once your wallet is funded:
1. ✅ Go back to your app
2. ✅ Connect your MetaMask wallet
3. ✅ Try sending USDT to another wallet
4. ✅ Check transaction on Etherscan

## Deployer Wallet Info

**Deployer Address:** `0x5De853eA28F8a851677C3A158DB617ea726b2B7D`  
This wallet already has 10,000 USDT minted from deployment.

