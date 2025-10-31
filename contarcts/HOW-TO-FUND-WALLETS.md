# How to Fund Wallets with MockUSDT

## What are Wallet 1 and Wallet 2?

These are **your MetaMask wallet addresses** (or any Ethereum addresses you want to fund with test USDT).

You can fund **as many wallets as you want** - just add more addresses to the command.

## How to Get Your Wallet Addresses

### From MetaMask:
1. Open MetaMask
2. Click on your account name at the top
3. Your wallet address will be displayed (it starts with `0x`)
4. Click to copy it

### Example wallet addresses:
```
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

## Usage Examples

### Fund 1 Wallet:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xYourFirstWalletAddress
```

### Fund 2 Wallets:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xYourFirstWalletAddress 0xYourSecondWalletAddress
```

### Fund 3 Wallets:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xWallet1 0xWallet2 0xWallet3
```

## Step-by-Step Instructions

### Step 1: Get Your Wallet Addresses
1. Open MetaMask
2. Switch to **Sepolia testnet** (important!)
3. Copy your wallet address (starts with `0x`)

### Step 2: Deploy MockUSDT First
Before funding wallets, make sure MockUSDT is deployed:
```bash
cd contarcts
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
```

This will:
- Deploy the MockUSDT contract
- Mint 10,000 USDT to your deployer wallet
- Save the USDT address to `usdt-deployment.json`

### Step 3: Fund Your Wallets
Now you can fund your test wallets:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xYourWalletAddress
```

This will mint **1,000 USDT** to each address you provide.

### Step 4: Verify Balance in MetaMask
1. Open MetaMask
2. Make sure you're on **Sepolia testnet**
3. You should see your USDT balance
4. If you don't see USDT:
   - Click "Import tokens"
   - Add USDT contract address (from deployment)
   - USDT token symbol should appear

## Common Scenarios

### Scenario 1: Testing with One Wallet (You Only)
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xYourPersonalWallet
```

### Scenario 2: Testing P2P Transfer (You + Friend/Another Account)
1. **Your wallet:** `0xYourWalletAddress`
2. **Friend's wallet or your second account:** `0xFriendOrSecondAccountAddress`

```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xYourWalletAddress 0xFriendOrSecondAccountAddress
```

Now you can:
- Send USDT from your wallet to friend's wallet
- Test the full P2P transfer flow

### Scenario 3: Testing with Multiple Test Accounts
If you have multiple MetaMask accounts:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0xAccount1 0xAccount2 0xAccount3
```

## Troubleshooting

### Error: "USDT address not found"
**Solution:** Deploy MockUSDT first using `deploy-mock-usdt.js`

### Error: "Insufficient funds for gas"
**Solution:** Your deployer wallet needs Sepolia ETH for gas fees. Get it from https://sepoliafaucet.com/

### I don't see USDT in MetaMask
**Solution:** 
1. Make sure you're on Sepolia testnet
2. Click "Import tokens" in MetaMask
3. Add the USDT contract address from your deployment

### I want to fund more than 1,000 USDT
**Solution:** Edit `fund-wallets.js` line 40:
```javascript
const mintAmount = ethers.parseUnits("5000", 6); // 5,000 USDT instead
```

### The command says "usage" but I provided addresses
**Solution:** Make sure addresses:
- Start with `0x`
- Are 42 characters total
- Are valid Ethereum addresses

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `fund-wallets.js 0xWallet1` | Mints 1,000 USDT to Wallet1 |
| `fund-wallets.js 0xWallet1 0xWallet2` | Mints 1,000 USDT to both wallets |
| `fund-wallets.js 0x1 0x2 0x3` | Mints 1,000 USDT to three wallets |

## Security Notes

- ✅ These are **test tokens** on **Sepolia testnet**
- ✅ They have **no real value**
- ✅ You can mint as many as you want
- ✅ Use for testing P2P transfers only
- ❌ DO NOT use the deployer's private key on mainnet
- ❌ NEVER share your private keys

## Example Walkthrough

Let's say you want to test sending USDT from your wallet to a friend:

1. **Your MetaMask address:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
2. **Friend's MetaMask address:** `0x8ba1f109551bD432803012645Hac136c37002000`

Run:
```bash
npx hardhat run scripts/fund-wallets.js --network sepolia 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 0x8ba1f109551bD432803012645Hac136c37002000
```

Now both wallets have 1,000 USDT to test with!

## Next Steps

After funding wallets:
1. ✅ Test sending USDT in your app
2. ✅ Verify transactions on Sepolia Etherscan
3. ✅ Check balances in MetaMask
4. ✅ Test receiving USDT in your app

