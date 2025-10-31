# How to Get Sepolia Testnet ETH

Your deployer wallet has 0 balance. You need Sepolia ETH to deploy contracts.

## Step 1: Check Your Wallet Address

Run this command to see your wallet address:

```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

This will show you:
- Your wallet address (copy this!)
- Your current balance
- Network information

## Step 2: Get Sepolia ETH from a Faucet

Visit one of these faucets and paste your wallet address:

### Recommended Faucets:

1. **Alchemy Sepolia Faucet** (Best - usually instant)
   - URL: https://sepoliafaucet.com/
   - Connect with Alchemy account or social media
   - Gives: 0.5 ETH per day

2. **Infura Sepolia Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requires Infura account
   - Gives: 0.5 ETH per day

3. **QuickNode Sepolia Faucet**
   - URL: https://faucet.quicknode.com/ethereum/sepolia
   - Requires QuickNode account
   - Gives: 0.1 ETH

4. **Chainlink Sepolia Faucet**
   - URL: https://faucets.chain.link/sepolia
   - No account required
   - Gives: 0.1 ETH

5. **PoW Sepolia Faucet** (If others don't work)
   - URL: https://sepolia-faucet.pk910.de/
   - Requires mining (proof of work)
   - Can get more ETH but takes longer

## Step 3: Verify Your Balance

After requesting ETH from a faucet, wait 1-2 minutes for the transaction to confirm, then run:

```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

You should see your balance updated!

## Step 4: Deploy Your Contract

Once you have ETH (at least 0.01 ETH recommended), deploy your MockUSDT:

```bash
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
```

## Troubleshooting

**Problem:** Faucet says "Rate limit exceeded" or "Try again later"
- **Solution:** Try a different faucet or wait 24 hours

**Problem:** Transaction pending for a long time
- **Solution:** Sepolia can be slow. Wait 5-10 minutes, then check balance again

**Problem:** Can't connect to Sepolia network
- **Solution:** Check your `.env` file has correct `SEPOLIA_RPC_URL` and `PRIVATE_KEY`

## Verify on Etherscan

After getting ETH, you can verify your wallet on Sepolia Etherscan:
- URL: https://sepolia.etherscan.io/address/YOUR_ADDRESS
- Replace `YOUR_ADDRESS` with your wallet address from Step 1

