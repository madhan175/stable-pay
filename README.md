# 🇮🇳 StablePay 2.0 — UPI to Stablecoin Sovereign Bridge

<div align="center">

```
   _____ _        _     _      _____             ___   ___  
  / ____| |      | |   | |    |  __ \           |__ \ / _ \ 
 | (___ | |_ __ _| |__ | | ___| |__) |_ _ _   _    ) | | | |
  \___ \| __/ _` | '_ \| |/ _ \  ___/ _` | | | |  / /| | | |
  ____) | || (_| | |_) | |  __/ |  | (_| | |_| | / /_| |_| |
 |_____/ \__\__,_|_.__/|_|\___|_|   \__,_|\__, |____(_)___/ 
                                           __/ |            
                                          |___/             
```

### **The Sovereign Bridge Connecting India's UPI Real-Time Rails & Web3 Stablecoin Liquidity**

[![Hackathon](https://img.shields.io/badge/Hackathon-Drunix%20Hackathon%20with%20Citi-blue?style=for-the-badge&logo=citi)](https://indiablockchainforum.com)
[![Challenge Code](https://img.shields.io/badge/Challenge%20Code-CHL--7007-orange?style=for-the-badge)](https://indiablockchainforum.com)
[![Organizer](https://img.shields.io/badge/Organizer-India%20Blockchain%20Forum-green?style=for-the-badge)](https://indiablockchainforum.com)
[![Domain](https://img.shields.io/badge/Domain-Blockchain%20%7C%20Fintech-purple?style=for-the-badge)](#)
[![Network](https://img.shields.io/badge/Network-Ethereum%20Sepolia%20%2F%20Drunix%20EVM-yellow?style=for-the-badge&logo=ethereum)](#smart-contract-architecture)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)](LICENSE)

---

**[🌐 Overview](#-executive-overview)** • **[📑 Hackathon Submission](#-hackathon-submission-dossier)** • **[📜 Smart Contracts](#-smart-contract-architecture)** • **[🚀 Quick Start](#-quick-start--setup-guide)** • **[📊 Architecture](#-system-architecture)**

---

</div>

## 📌 Executive Overview

**StablePay 2.0** is an institutional-grade, decentralized payment gateway and settlement layer purpose-built for India's digital payment ecosystem. It bridges **Unified Payments Interface (UPI)** with **Web3 Stablecoins (USDT/USDC)** on EVM-compatible execution environments (including the **Drunix platform**).

By interfacing India's world-leading real-time retail payment rail (14+ billion monthly UPI transactions) with sovereign Web3 liquidity, StablePay 2.0 solves the multi-billion-dollar friction in cross-border inward remittances, export payments for MSMEs, and merchant micro-settlements—with **sub-second finality**, **fraction-of-a-cent gas overheads**, **automated GST/TDS tax deductions**, and **strict AML/KYC compliance**.

---

## 🎯 Hackathon Alignment: Drunix Hackathon with Citi

| Challenge Parameter | Submission Details |
| :--- | :--- |
| **Organization** | **India Blockchain Forum** |
| **Challenge Title** | **Drunix Hackathon In collaboration with Citi** |
| **Challenge Code** | **CHL-7007** |
| **Domain** | **Blockchain & Transformative Fintech Infrastructure** |
| **Target Platforms** | **Drunix EVM, NPCI UPI Rails, Citi Treasury & Liquidity Mentorship** |
| **Status** | **Open / Deployed Prototype & Production-Ready Codebase** |

### Problem Statement Direct Coverage:

1. **⚡ Real-Time Payments (Primary)**:
   Instant, bi-directional settlement between Indian National Unified Payments Interface (UPI) and blockchain stablecoin liquidity, eliminating T+2 settlement windows and banking float delays.
2. **🌍 Cross-Border Remittances (Primary)**:
   Slashing remittance costs from the global average of **6.2%** down to **< 0.5%**, routing international transfers directly into domestic recipient UPI IDs and VPA handles in seconds.
3. **🤝 Financial Inclusion (Key Enabler)**:
   Empowering over 50 Million Indian merchants, freelancers, gig economy participants, and MSMEs to receive borderless payments using existing BharatQR and UPI QR codes without requiring Web3 custody literacy.
4. **💡 Innovative Fintech Ideas (Key Enabler)**:
   On-chain automated GST/TDS tax accounting built directly into smart contract swaps, real-time fiat-crypto rate feeds, AI-driven OCR KYC verification (Aadhaar/PAN/Passport), and an installable offline-ready Progressive Web App (PWA) with WebAuthn biometric security.

---

## 🌟 The Core Problem & Market Opportunity

```
Current Banking System (SWIFT / Cards)
[Foreign Payer] ───> [Sender Bank] ───> [Intermediary / SWIFT] ───> [Foreign FX Margin] ───> [Indian Bank] ───> [Merchant]
                     (Takes 2 to 5 Business Days | High FX Spread 4-7% | Intermediary Fees $15-$45)

StablePay 2.0 Protocol (Drunix / EVM + NPCI UPI)
[Foreign Payer / Web3 Wallet] ───> [FiatUSDTSwap Smart Contract] ───> [Real-Time UPI Rail] ───> [Indian Merchant / User]
                                  (Under 3 Seconds | 0.25% Flat Fee | Automated GST Compliance)
```

- **The Inward Remittance Bottleneck**: India is the world's largest remittance recipient ($125B+ annually). However, foreign inward remittances through traditional correspondent banking (SWIFT) suffer from exorbitant fee structures (4–7%), opaque foreign exchange spreads, and delayed settlement cycles (48–72 hours).
- **MSME Global Commerce Barrier**: Indian small businesses and tech freelancers selling software, handicrafts, and services globally face prohibitive merchant gateway fees (Stripe/PayPal charge 4.5% + fixed fees + $0.35 + adverse forex spreads), leading to high cart abandonment and cash flow lockups.
- **Crypto Volatility & Complexity**: Cryptocurrencies like Bitcoin or Ethereum fluctuate too widely for commerce. While stablecoins (USDT/USDC) provide price certainty, Indian merchants cannot easily off-ramp or accept them at the checkout counter without facing technical hurdles and regulatory reporting anxiety.

---

## 💡 The StablePay 2.0 Solution

**StablePay 2.0** is an institutional cross-border payment infrastructure that uses stablecoins as an underlying settlement rail while keeping blockchain complexity completely invisible to the end user. 

Rather than seeking to replace commercial banks or sovereign domestic payment systems (like NPCI's UPI), StablePay 2.0 **upgrades the cross-border settlement layer underneath them**. 

A global sender initiates a transfer in their local fiat currency. The platform determines an optimal liquidity and settlement route, converts the value into a secure stablecoin asset (USDT/USDC), settles it over EVM-compatible execution layers (including the **Drunix platform** and **Sepolia**), and delivers the proceeds instantly into the recipient's domestic bank account via UPI in INR.

The core breakthrough is a **7-Layer Modular Architecture** driven by a **Smart Liquidity Routing Engine** that evaluates live FX spreads, liquidity depth, network gas costs, settlement latency, and statutory compliance before executing an atomic swap.

---

## 🏛 7-Layer System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 7: USER INTERFACE & PWA EXPERIENCE                                              │
│  - Zero-barrier Progressive Web App (iOS / Android / Desktop)                          │
│  - Integrated Camera QR Scanner (BharatQR, UPI Intent, Web3 Wallets)                  │
│  - Biometric WebAuthn & 3D Interactive WebGL Visuals                                  │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│  LAYER 6: PAYMENT ORCHESTRATION & COMPLIANCE LAYER                                     │
│  - End-to-end transaction lifecycle tracking (Initiation ➔ Finality)                   │
│  - Automated statutory tax accounting (Built-in 18% GST & 1% TDS computation)          │
│  - AI-powered OCR Identity Verification (Aadhaar / PAN / Passport) & SMS OTP           │
│  - Real-time WebSocket state streaming (Socket.IO)                                     │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│  LAYER 3: SMART LIQUIDITY ROUTING ENGINE                                               │
│  - Evaluates real-time FX exchange rates & provider fees                               │
│  - Dynamic slippage protection & gas optimization algorithms                           │
│  - Selects optimal atomic route between fiat rails and stablecoin liquidity pools      │
└───────────────────┬────────────────────────────────────────────┬───────────────────────┘
                    │                                            │
┌───────────────────▼─────────────────────┐  ┌───────────────────▼───────────────────────┐
│  LAYER 1: FIAT ON-RAMP LAYER            │  │  LAYER 5: FIAT OFF-RAMP LAYER (UPI/NPCI) │
│  - Ingests fiat from global senders     │  │  - Instant payout directly into Indian    │
│  - Bank transfer & card rails           │  │    bank accounts via recipient UPI VPAs   │
│  - Webhook validation & proof of deposit│  │  - Zero crypto custody friction for MSMEs │
└───────────────────┬─────────────────────┘  └───────────────────┬───────────────────────┘
                    │                                            │
┌───────────────────▼────────────────────────────────────────────▼───────────────────────┐
│  LAYER 2: LIQUIDITY & TREASURY LAYER                                                   │
│  - Rebalances fiat/stablecoin liquidity between regional corridors                     │
│  - Citi Treasury mentorship aligned liquidity management & reserve verification        │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│  LAYER 4: BLOCKCHAIN SETTLEMENT LAYER (DRUNIX EVM / SEPOLIA)                           │
│  - FiatUSDTSwap.sol Core Smart Contract                                                │
│  - Atomic on-chain swap execution & cryptographic txHash deduplication                 │
│  - SafeERC20 asset custody (USDT / USDC) with sub-second settlement finality           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contract Architecture

The core financial logic is managed by Solidity smart contracts deployed and verified on **Ethereum Sepolia** (and ready for one-click deployment on **Drunix EVM**).

### Contract Addresses & Verification:

| Contract | Network | Contract Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| **FiatUSDTSwap (Core Engine)** | Sepolia Testnet | `0xeAB6f03ad3C23224d50e15a9F0A2024004d53408` | [View on Etherscan](https://sepolia.etherscan.io/address/0xeAB6f03ad3C23224d50e15a9F0A2024004d53408) |
| **Mock USDT (ERC-20 Token)** | Sepolia Testnet | `0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD` | [View on Etherscan](https://sepolia.etherscan.io/token/0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD) |

### Key Contract Methods:

```solidity
// Calculate conversion amount and automated GST deduction
function calculateSwap(
    string memory fromCurrency, 
    string memory toCurrency, 
    uint256 fromAmount
) external view returns (uint256 toAmount, uint256 gstAmount);

// Execute stablecoin off-ramp to fiat settlement
function swapUSDTToFiat(
    string memory toCurrency, 
    uint256 usdtAmount, 
    bytes32 txHash
) external;

// Record and settle fiat on-ramp to stablecoin mint/transfer
function swapFiatToUSDT(
    address user, 
    string memory fromCurrency, 
    uint256 fromAmount, 
    bytes32 txHash
) external;

// Retrieve immutable on-chain audit trail for a user
function getUserSwapHistory(address user) 
    external view returns (SwapRecord[] memory);
```

### Security & Integrity Highlights:
- **OpenZeppelin Standards**: Built using audited `@openzeppelin/contracts` implementations (`SafeERC20`, `ReentrancyGuard`, `Ownable`).
- **Protection Against Frontrunning**: On-chain timestamp validations and cryptographic `bytes32 txHash` deduplication prevent replay attacks.
- **Precision Accounting**: Native 6-decimal precision matching standard USDT / USDC implementations with zero precision loss during INR calculations.

---

## 🛠 Technology Stack

### Frontend Application
- **Core Framework**: React 18, Vite 7, TypeScript 5
- **Styling & UI**: Tailwind CSS, Framer Motion (micro-interactions & fluid page transitions), Lucide Icons
- **3D Interactive Visuals**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Web3 Integration**: Ethers.js v6, MetaMask Provider, EIP-1193 connector
- **PWA & Offline Capabilities**: `vite-plugin-pwa`, Workbox service worker caching, standalone Web App Manifest
- **QR Code Engine**: `html5-qrcode` (video stream decoding), `react-qr-code` (dynamic UPI & address vector generation)

### Backend Engine & Services
- **Runtime**: Node.js (v18+ LTS), Express.js
- **Real-Time Layer**: Socket.IO (bidirectional price stream & instant notification engine)
- **Computer Vision & OCR**: Tesseract.js (Hindi & English trained data models) + Google Cloud Vision fallback
- **Authentication & Security**: JSON Web Tokens (JWT), Bcrypt, Express Rate Limiter, Helmet
- **Telephony**: Twilio SDK for instant SMS OTP dispatch

### Database & Cloud Services
- **Primary Database**: Supabase PostgreSQL with custom SQL schema
- **Security Policies**: Enterprise Row-Level Security (RLS) guaranteeing tenant isolation
- **File Storage**: Supabase S3-compatible encrypted document storage for KYC audit records

---

## 📁 Refurbished Project Structure

```
StablePay2.0/
├── backend/                        # Node.js + Express Backend Service
│   ├── database/                   # Supabase SQL Schemas & RLS Policies
│   │   ├── fix-transactions-rls-policies.sql
│   │   ├── fix-user-rls-policies.sql
│   │   ├── setup-supabase.sql
│   │   ├── supabase-schema.sql
│   │   └── update-transactions-schema.sql
│   ├── models/                     # Data Models & Schema Mappings
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── services/                   # Business Logic & External Integrations
│   │   ├── contractService.js      # Ethers.js Smart Contract Event Listeners
│   │   ├── ocrService.js           # Tesseract & Vision Document Extraction
│   │   ├── otpService.js           # Twilio Multi-Channel OTP Dispatcher
│   │   ├── supabaseService.js      # PostgreSQL ORM & Real-Time Sync
│   │   └── transactionService.js   # Settlement & Accounting Pipeline
│   ├── uploads/                    # Temporary Secure Document Ingestion
│   │   └── .gitkeep
│   ├── eng.traineddata             # OCR Trained Data (English)
│   ├── hin.traineddata             # OCR Trained Data (Hindi)
│   ├── env.example                 # Backend Environment Template
│   ├── package.json
│   ├── render.yaml                 # Infrastructure as Code (Render Deploy)
│   └── server.js                   # Main Server & Socket.IO Entrypoint
│
├── frontend/                       # React 18 + TypeScript PWA Frontend
│   ├── public/                     # Static Assets & PWA Manifest
│   │   ├── apple-touch-icon.png
│   │   ├── manifest.webmanifest
│   │   ├── pwa-192x192.png
│   │   └── pwa-512x512.png
│   ├── src/
│   │   ├── components/             # Reusable UI & Web3 Components
│   │   │   ├── BiometricAuth.tsx   # Face / WebAuthn Biometric Modal
│   │   │   ├── CurrencyRateDisplay.tsx # Live Forex & Slippage Widget
│   │   │   ├── FaceVerification.tsx# Liveness & Camera Detection
│   │   │   ├── KYCModal.tsx        # Multi-Step Identity Verification
│   │   │   ├── KYCUpload.tsx       # Drag-and-Drop Document Uploader
│   │   │   ├── Layout.tsx          # Master App Frame & Navigation
│   │   │   ├── PhoneOTPModal.tsx   # Instant SMS Verification Flow
│   │   │   ├── QRScanner.tsx       # Live Video UPI/Crypto Scanner
│   │   │   ├── ThreeScene.tsx      # Interactive 3D WebGL Canvas
│   │   │   ├── WalletConnect.tsx   # MetaMask Connector & Network Guard
│   │   │   └── WalletQRCode.tsx    # Dynamic BharatQR / Address Generator
│   │   ├── config/
│   │   │   └── contracts.ts        # ABIs, Addresses, & Network Enforcers
│   │   ├── context/                # Global React State Providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── KYCContext.tsx
│   │   │   └── WalletContext.tsx
│   │   ├── pages/                  # Route Pages
│   │   │   ├── Admin.tsx           # Compliance & System Management
│   │   │   ├── AdminAnalytics.tsx  # Volume, Velocity, & Fee Dashboards
│   │   │   ├── Buy.tsx             # INR to USDT Conversion Terminal
│   │   │   ├── History.tsx         # Immutable Transaction Ledger
│   │   │   ├── Home.tsx            # Consumer & Merchant Hub
│   │   │   ├── Landing.tsx         # Hero Showcase & Protocol Overview
│   │   │   ├── Receive.tsx         # Merchant Terminal & Payment Receiver
│   │   │   ├── Send.tsx            # P2P Transfer & Remittance Terminal
│   │   │   └── UserDashboard.tsx   # Balance, Limits & KYC Status
│   │   ├── services/               # API, Currency, and Socket Clients
│   │   │   ├── api.ts
│   │   │   ├── currencyService.ts
│   │   │   └── socketService.ts
│   │   ├── utils/
│   │   │   ├── blockchain.ts       # Ethers.js v6 Robust Provider Utilities
│   │   │   ├── contractIntegration.ts
│   │   │   └── mobileWallet.ts
│   │   ├── App.tsx                 # Root Router & Protected Routes
│   │   ├── index.css               # Design System & Tailwind Directives
│   │   └── main.tsx                # React DOM Mount
│   ├── env.example.txt             # Frontend Environment Template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json                 # SPA Rewrites & Header Policies
│   └── vite.config.ts              # Vite Bundler & PWA Config
│
├── .gitignore                      # Git Hygiene (Excludes secrets & builds)
├── package.json                    # Workspace Monorepo Root
└── README.md                       # Master Documentation
```

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MetaMask**: Browser extension or Mobile Wallet with Sepolia Testnet configured
- **Supabase Account**: Free project instance for database & real-time sync

### 2. Clone the Repository
```bash
git clone https://github.com/madhan175/stable-pay.git
cd stable-pay/StablePay2.0
```

### 3. Configure Environment Variables

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Smart Contracts
CONTRACT_ADDRESS=0xeAB6f03ad3C23224d50e15a9F0A2024004d53408
USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CONTRACT_ADDRESS=0xeAB6f03ad3C23224d50e15a9F0A2024004d53408
VITE_USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD
```

### 4. Install Dependencies & Launch

From the root repository directory:

```bash
# Install all workspace dependencies
npm install

# Terminal 1: Launch Backend API Server
npm run dev:backend

# Terminal 2: Launch Frontend Application
npm run dev:frontend
```

Open `http://localhost:5173` in your browser. The application will automatically detect your MetaMask wallet and prompt network synchronization to Sepolia Testnet.

---

## 📱 User Journeys & Workflow

### 1. User Sending INR via UPI (On-Ramp to USDT)
1. User connects MetaMask and completes phone OTP verification.
2. User enters desired INR amount (e.g., ₹5,000).
3. The platform displays real-time exchange rates, calculated USDT output, and automated 18% GST deduction.
4. User scans the generated UPI QR code in any UPI app (Google Pay, PhonePe, Paytm).
5. Upon confirmation, the smart contract settles USDT directly into the recipient's wallet.

### 2. Merchant Receiving Borderless Cross-Border Remittances
1. Indian merchant prints or displays their StablePay BharatQR / Wallet QR code.
2. An overseas client scans and pays with USDT from any Web3 wallet.
3. The transaction is validated on-chain in under 3 seconds.
4. Merchant's dashboard displays real-time credit notification with automated tax computation and transaction receipt generation.

---

## 🔒 Security, Compliance & Regulatory Safeguards

- **FIU-IND & Regulatory Alignment**: Adheres to Financial Intelligence Unit – India (FIU-IND) reporting norms by establishing tiered KYC limits: transactions over $200 mandate verified identity documentation and face matching.
- **On-Chain Tax Transparency**: Built-in statutory tax calculation (GST and TDS) directly embedded in smart contract execution, providing transparent, audit-ready compliance records for accounting.
- **Client & Smart Contract Defense**: Reentrancy guards, EIP-1559 gas price fallbacks, safe address checksumming, and robust Row-Level Security (RLS) policies on all database tables.

---

## 📋 Hackathon Submission Dossier

### 📄 Proposal Title
**StablePay 2.0 — Next-Generation Decentralized UPI-to-Stablecoin Sovereign Settlement Layer for Real-Time Cross-Border Payments & Financial Inclusion**

### 🧠 Problem Understanding
India possesses the world's most sophisticated real-time retail payment infrastructure in the National Payments Corporation of India's (NPCI) UPI, processing over 14 billion transactions monthly. Concurrently, India receives over $125 Billion annually in cross-border inward remittances. 

Despite these strengths, the cross-border remittance corridor remains tethered to legacy correspondent banking (SWIFT). Senders face exorbitant transaction fees (4–7%), hidden foreign exchange spreads, and settlement delays of 48–72 hours. Furthermore, Indian micro, small, and medium enterprises (MSMEs) and knowledge workers seeking global clients face severe friction: international payment gateways charge onerous fees (4.5%+), while cryptocurrency payments are too volatile, technically intimidating, and fraught with taxation and compliance ambiguity.

### 💡 Solution Description
StablePay 2.0 solves this fundamental disconnect by uniting **NPCI's instant UPI payment rails** with **blockchain stablecoin liquidity** on EVM-compatible networks such as the Drunix platform. 

StablePay 2.0 functions as a frictionless sovereign settlement gateway. International senders can transmit stablecoins (USDT/USDC) with sub-second finality and near-zero gas costs; the smart contract automatically calculates and records statutory tax obligations (GST/TDS) and enables instant settlement directly into domestic merchants' and recipients' UPI-linked accounts. For Indian users, it provides a safe, regulated on-ramp to convert domestic INR via any UPI app into stable liquidity.

### 🏗 Implementation Approach
Our architecture implements an end-to-end full-stack prototype:
1. **On-Chain Settlement**: Custom `FiatUSDTSwap.sol` smart contract implementing precision-arithmetic conversion, automated tax collection, transaction deduplication, and SafeERC20 asset custody on Ethereum Sepolia / Drunix EVM.
2. **Real-Time Orchestration Layer**: Express.js and Socket.IO microservice managing live rate feeds, webhook listeners, and instant settlement notifications.
3. **Automated Regulatory Compliance**: Multi-layered KYC pipeline featuring Tesseract OCR and Computer Vision for real-time document parsing (Aadhaar/PAN/Passport), coupled with SMS OTP authentication and biometric verification for tiered transaction thresholds.
4. **Mobile-First Experience**: High-performance Progressive Web App (PWA) built with React 18, Vite, Tailwind CSS, Three.js, and browser-native camera QR scanners, ensuring zero app-store barrier for Indian merchants.

### 💻 Technology Stack
- **Smart Contracts / Layer 1/2**: Solidity (v0.8.20+), OpenZeppelin, Ethers.js v6, Ethereum Sepolia Testnet, Drunix Platform Compatible.
- **Frontend Architecture**: React 18, Vite 7, TypeScript, Tailwind CSS, Framer Motion, Three.js / WebGL, PWA Service Worker.
- **Backend Infrastructure**: Node.js, Express.js, Socket.IO, Multer, PDFKit.
- **Compliance & Identity**: Tesseract.js (English & Hindi OCR), Google Cloud Vision, Twilio OTP API, WebAuthn.
- **Data Persistence**: Supabase PostgreSQL with strict Row Level Security (RLS) policies and encrypted document buckets.

### 🚀 Expected Impact
1. **Remittance Cost Reduction**: Lowers inward remittance fees from the global average of **6.2%** to **< 0.5%**, directly preserving billions of dollars for Indian families and migrant workers.
2. **Empowering 50M+ MSMEs**: Enables Indian small businesses, artisans, and freelancers to accept borderless payments instantly using standard UPI QR codes without opening foreign currency bank accounts.
3. **Cash Flow Acceleration**: Shrinks settlement cycles from 2–5 business days down to **under 3 seconds**, boosting working capital velocity across the Indian economy.
4. **Regulatory Clarity & Tax Automation**: Eliminates tax compliance ambiguity by baking transparent GST and TDS accounting directly into on-chain swap events, establishing a gold standard for responsible Web3 financial innovation in India.

---

## 🗺 Roadmap & Future Evolution

- [x] **Phase 1: Prototype & Testnet Settlement** (Completed)
  - Deployed `FiatUSDTSwap` on Sepolia Testnet with verified token contracts.
  - Built functional PWA with QR scanning, live rates, and automated GST deduction.
  - Implemented OCR KYC verification and SMS OTP validation.
- [ ] **Phase 2: Drunix Platform & NPCI Sandbox Integration** (In Progress)
  - Deploy contracts natively on Drunix EVM testnet.
  - Direct integration with NPCI UPI API sandboxes for automated VPA resolution and webhook settlement.
  - Citi Treasury mentorship collaboration for institutional liquidity pool backing.
- [ ] **Phase 3: Account Abstraction (ERC-4337) & Gasless Transactions**
  - Implement Paymasters so Indian users can transact without holding native gas tokens.
  - UPI Intent deep-linking for one-click mobile app switching.
- [ ] **Phase 4: Mainnet Launch & Regulatory Sandbox**
  - Application for RBI Regulatory Sandbox cohort on cross-border payments.
  - Expansion to support multi-currency stablecoins (EURC, XSGD, AEDT).

---

## 🤝 Acknowledgments & Credits

Developed with pride for the **India Blockchain Forum**, participating in the **Drunix Hackathon in collaboration with Citi** (Challenge Code: **CHL-7007**). 

Special thanks to:
- **India Blockchain Forum** for driving blockchain adoption and thought leadership across India.
- **Drunix Platform** for cutting-edge fintech infrastructure and developer ecosystem.
- **Citi Mentors & NPCI** for guidance on scalable real-time payment architectures.

---

<div align="center">

**Built for India's Digital Future 🇮🇳**

</div>
