# StablePay Frontend

React + TypeScript + Vite frontend application for StablePay platform.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── context/        # React context providers
│   ├── services/       # API and service integrations
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── lib/            # Library integrations
├── index.html          # Entry HTML file
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory (see `.env.example`):

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Smart Contract Address (optional)
VITE_CONTRACT_ADDRESS=0x...
```

## 🌐 Deployment to Vercel

### Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub repository connected to Vercel
3. Environment variables configured

### Deployment Steps

#### Option 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `frontend`  
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_API_URL=https://your-backend.onrender.com
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     VITE_CONTRACT_ADDRESS=0x... (optional)
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

- **VITE_API_URL**: Your Render backend URL (e.g., `https://your-backend.onrender.com`)
- **VITE_SUPABASE_URL**: Your Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key
- **VITE_CONTRACT_ADDRESS**: (Optional) Deployed contract address

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔗 Integration with Backend

The frontend communicates with the backend API deployed on Render. Make sure:

1. **CORS is configured** in backend to allow requests from your Vercel domain
2. **API URL is correct** in environment variables
3. **WebSocket connections** are properly configured for real-time features

### Backend URL Configuration

In development, backend runs at `http://localhost:5000`.  
In production, use your Render deployment URL.

## 📦 Build & Deploy

### Local Build

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## 🐛 Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check environment variables are set correctly

### API Connection Issues

- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Verify backend is running and accessible

### Environment Variables Not Working

- Restart dev server after adding `.env` file
- In Vercel, ensure variables are prefixed with `VITE_`
- Variables must be set in Vercel dashboard for production

## 📚 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Ethers.js** - Blockchain integration
- **Axios** - HTTP client
- **Socket.io** - Real-time communication
- **Supabase** - Backend services

## 📝 Notes

- Frontend is designed to work with backend deployed on Render
- Smart contract interactions require MetaMask or compatible wallet
- Some features may work in mock mode if backend is unavailable

