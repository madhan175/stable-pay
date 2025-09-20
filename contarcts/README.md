# Stable Coin Contracts

Smart contracts for the StablePay application, handling USDT swaps with GST calculations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask (for testing)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Compile contracts:**
```bash
npm run compile
```

## 🧪 Testing

### Run Tests Locally
```bash
# Start local Hardhat node
npm run node

# In another terminal, run tests
npm run test
```

### Test Coverage
The test suite covers:
- ✅ Contract deployment
- ✅ Currency rate calculations
- ✅ GST calculations for INR transactions
- ✅ USDT to Fiat swaps
- ✅ Swap history tracking
- ✅ Admin functions
- ✅ Error handling

## 🚀 Deployment

### Local Deployment
```bash
# Start local node
npm run node

# Deploy to local network
npm run deploy:local
```

### Sepolia Testnet Deployment
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## 📋 Contract Functions

### Public Functions
- `calculateSwap(fromCurrency, toCurrency, fromAmount)` - Calculate swap amounts with GST
- `swapUSDTToFiat(toCurrency, usdtAmount, txHash)` - Swap USDT to Fiat currency
- `getUserSwapHistory(user)` - Get user's swap history
- `getRecentSwaps()` - Get recent swaps (last 10)
- `isCurrencySupported(currency)` - Check if currency is supported

### Admin Functions
- `swapFiatToUSDT(user, fromCurrency, fromAmount, txHash)` - Swap Fiat to USDT
- `updateCurrency(currency, rate, supported)` - Update currency rates

## 🔧 Configuration

### Supported Currencies
- **USDT** - Base currency (rate: 1.0)
- **USD** - US Dollar (rate: 1.0)
- **EUR** - Euro (rate: 0.92)
- **INR** - Indian Rupee (rate: 88.0)

### GST Configuration
- **GST Rate**: 18% (1800 basis points)
- **Applies to**: All INR transactions (INR ↔ USDT)

## 📊 Contract Details

### Constructor Parameters
- `_usdt`: USDT token contract address

### Events
- `SwapExecuted`: Emitted when a swap is completed
- `CurrencyUpdated`: Emitted when currency rates are updated

### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Admin-only functions**: Only admin can update rates
- **Transaction hash tracking**: Prevents duplicate processing

## 🌐 Network Configuration

### Local Development
- **Network**: localhost
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

### Sepolia Testnet
- **Network**: sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_KEY

## 📝 Usage Examples

### Calculate Swap
```javascript
const [toAmount, gstAmount] = await contract.calculateSwap("USDT", "INR", ethers.parseUnits("100", 6));
console.log(`100 USDT = ${ethers.formatUnits(toAmount, 6)} INR`);
console.log(`GST: ${ethers.formatUnits(gstAmount, 6)} INR`);
```

### Execute Swap
```javascript
const txHash = ethers.keccak256(ethers.toUtf8Bytes("unique-tx-hash"));
await contract.swapUSDTToFiat("INR", ethers.parseUnits("100", 6), txHash);
```

### Get Swap History
```javascript
const history = await contract.getUserSwapHistory(userAddress);
console.log(`User has ${history.length} swaps`);
```

## 🔍 Troubleshooting

### Common Issues

1. **"Insufficient balance"**
   - Ensure user has enough USDT
   - Check USDT allowance for contract

2. **"Already processed"**
   - Use unique transaction hash for each swap
   - Check if transaction was already processed

3. **"Only admin"**
   - Only contract admin can call admin functions
   - Check if you're using the correct account

### Gas Optimization
- Contract uses OpenZeppelin's SafeERC20 for gas optimization
- ReentrancyGuard prevents gas limit issues
- Optimized for 200 runs in Solidity compiler

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact the development team
- Check the documentation
