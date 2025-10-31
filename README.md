# StablePay 2.0 - UPI to USDT Bridge

A decentralized application that enables users in India to pay merchants in INR via UPI, while merchants instantly receive USDT stablecoins in their wallet.

## 📁 Project Structure

```
StablePay2.0/
├── frontend/          # React + Vite frontend (Deploy to Vercel)
├── backend/          # Node.js + Express backend (Deploy to Render)
├── contarcts/        # Smart contracts (Deploy to Sepolia)
└── DEPLOYMENT.md     # Deployment guide
```

## 🚀 Quick Deploy

**Want to deploy to production?**

👉 **[QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)** - Deploy in ~1 hour!

**Need more info?**
- [Complete Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./DEPLOYMENT-ENV-VARS.md)
- [Deployment Overview](./DEPLOYMENT-README.md)

## 🚀 Features

- **Seamless UPI to USDT Bridge**: Users pay in INR, merchants receive USDT
- **MetaMask Integration**: Connect wallet and execute transactions on Sepolia testnet
- **KYC Verification**: Phone verification and document upload for compliance
- **Smart Contract Integration**: Uses FiatUSDTSwap contract for secure swaps
- **Real-time Conversion**: Live INR to USDT rates with GST calculation
- **Transaction History**: View all swap transactions and balances
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

**Frontend:**
- React + Vite
- TypeScript
- Tailwind CSS
- ethers.js v6
- React Router DOM

**Backend:**
- Node.js + Express
- Supabase (Database & Storage)
- Real-time subscriptions

**Blockchain:**
- Ethereum Sepolia Testnet
- Custom FiatUSDTSwap Smart Contract
- ERC20 USDT Token

## 📋 Prerequisites

Before running the application, you need:

1. **MetaMask Extension** installed in your browser
2. **Sepolia ETH** for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
3. **Contract Addresses** - Deploy contracts first (see `contarcts/` folder)

## 🔧 Development Setup

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

See [frontend/README.md](./frontend/README.md) for details.

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

See [backend/README.md](./backend/README.md) for details.

### Smart Contracts

```bash
cd contarcts
npm install
npx hardhat run scripts/deploy.js --network sepolia
```

See [contarcts/README.md](./contarcts/README.md) for details.

## 🌐 Deployment

### Quick Deployment Guide

1. **Deploy Backend to Render**
   - See [backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md)
   - Get your backend URL (e.g., `https://stablepay-backend.onrender.com`)

2. **Deploy Frontend to Vercel**
   - See [frontend/README.md](./frontend/README.md)
   - Set `VITE_API_URL` to your backend URL

3. **Update Backend CORS**
   - Add frontend Vercel URL to `ALLOWED_ORIGINS`
   - Restart backend service

For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 Documentation

- **Frontend**: [frontend/README.md](./frontend/README.md) - Frontend setup and Vercel deployment
- **Backend**: [backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md) - Backend setup and Render deployment
- **Contracts**: [contarcts/README.md](./contarcts/README.md) - Smart contract deployment
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide

## 🔧 Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd StablePay2.0
   npm install
   ```

2. **Configure Environment**
   - Click "Connect to Supabase" in the top right of the application
   - This will set up your database tables automatically

3. **Update Contract Addresses**
   - Deploy your FiatUSDTSwap contract to Sepolia
   - Update the contract addresses in `src/utils/blockchain.ts`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📱 How to Use

### For Users (Sending Payments):

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Verify Phone**: Complete phone verification (uses demo OTP system)
3. **Enter Amount**: Input INR amount to convert to USDT
4. **KYC Check**: For amounts >$200, complete KYC verification
5. **Execute Swap**: Confirm transaction in MetaMask (ensure you're on Sepolia)

### For Merchants (Receiving Payments):

1. **Connect Wallet**: Connect your MetaMask wallet
2. **View Dashboard**: See your USDT balance and transaction history
3. **Monitor Transactions**: Real-time updates of incoming swaps

## 🔐 Smart Contract Functions

The application integrates with these key contract functions:

- `calculateSwap()`: Get conversion rates and GST amounts
- `swapUSDTToFiat()`: Execute USDT to fiat currency swaps
- `getUserSwapHistory()`: Retrieve user's transaction history
- `getRecentSwaps()`: Get recent platform transactions

## 🌐 Network Configuration

The app automatically switches to Sepolia testnet. Network details:
- **Chain ID**: 11155111 (0xaa36a7)
- **RPC URL**: Sepolia Infura endpoint
- **Block Explorer**: https://sepolia.etherscan.io

## 🔍 Transaction Flow

1. User enters INR amount
2. Smart contract calculates USDT equivalent + GST
3. User approves USDT spending (if needed)
4. Contract executes swap and records transaction
5. Event emitted and UI updated with transaction hash

## 🛡 Security Features

- **KYC Compliance**: Phone verification and document upload
- **Transaction Limits**: $200 threshold for enhanced verification
- **Smart Contract Security**: Uses OpenZeppelin's SafeERC20
- **Network Validation**: Ensures transactions on correct network

## 📊 Database Schema

The app uses Supabase with these main tables:
- `users`: User profiles and KYC status
- `transactions`: Transaction records with amounts and status
- `kyc_documents`: Uploaded verification documents
- `otp_storage`: Phone verification codes

## 🚀 Deployment

The application is deployed and accessible at: [Your Deployment URL]

To deploy your own instance:
1. Deploy smart contracts to Sepolia
2. Update contract addresses in the code
3. Configure Supabase project
4. Deploy frontend to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Sepolia testnet
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is a demo application for educational purposes. Do not use with real funds on mainnet without proper security audits and regulatory compliance.