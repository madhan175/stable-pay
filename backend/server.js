require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Services
const supabaseService = require('./services/supabaseService');
const otpService = require('./services/otpService');
const ocrService = require('./services/ocrService');
const transactionService = require('./services/transactionService');
const contractService = require('./services/contractService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files (JPEG, PNG) and PDFs are allowed'));
  }
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_kyc_room', (userId) => {
    socket.join(`kyc_${userId}`);
    console.log(`User ${userId} joined KYC room`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const emitKYCUpdate = (userId, status, data = {}) => {
  io.to(`kyc_${userId}`).emit('kyc_update', {
    status,
    data,
    timestamp: new Date().toISOString()
  });
};

// -------- Routes --------

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// OTP Routes
app.post('/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    const result = await otpService.sendOTP(phone);
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    const result = await otpService.verifyOTP(phone, otp);
    if (result.success) {
      // Create a mock user for demo purposes (no Supabase needed)
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        phone: phone,
        phone_verified: true,
        kyc_status: 'none',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      console.log(`✅ [FAKE OTP] User verified: ${phone}`);
      res.json({ 
        success: true, 
        user: mockUser, 
        message: 'OTP verified successfully' 
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// KYC Status
app.get('/kyc/status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Mock KYC status for demo
    const mockUser = {
      id: 'demo-user-' + Date.now(),
      phone: phone,
      phone_verified: true,
      kyc_status: 'none',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    const mockDocuments = [];

    res.json({
      success: true,
      user: mockUser,
      documents: mockDocuments
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: 'Failed to get KYC status' });
  }
});

// KYC Upload
app.post('/kyc/upload', upload.single('document'), async (req, res) => {
  try {
    const { userId, documentType } = req.body;
    const file = req.file;
    if (!userId || !documentType || !file) {
      return res.status(400).json({ error: 'User ID, document type, and file required' });
    }

    emitKYCUpdate(userId, 'processing', { message: 'Processing document...' });

    const imageBuffer = fs.readFileSync(file.path);
    const extractedText = await ocrService.extractTextFromImage(imageBuffer);
    const ocrData = ocrService.parseIDData(extractedText);
    const validation = ocrService.validateKYCDocument(ocrData);

    // Mock KYC document creation
    const kycDocument = {
      id: 'doc-' + Date.now(),
      user_id: userId,
      type: documentType,
      file_url: file.path,
      ocr_data: ocrData,
      status: validation.isValid ? 'verified' : 'rejected',
      rejection_reason: validation.isValid ? null : validation.errors.join(', '),
      submitted_at: new Date().toISOString()
    };

    const newKycStatus = validation.isValid ? 'verified' : 'rejected';
    console.log(`📄 [MOCK KYC] Document processed: ${validation.isValid ? 'VERIFIED' : 'REJECTED'}`);

    emitKYCUpdate(userId, newKycStatus, {
      document: kycDocument,
      validation,
      message: validation.isValid ? 'KYC verified successfully' : 'KYC failed'
    });

    res.json({
      success: validation.isValid,
      document: kycDocument,
      validation,
      message: validation.isValid ? 'KYC verified successfully' : 'KYC failed'
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({ error: 'Failed to process KYC document' });
  }
});

// Transaction Routes
app.post('/tx/create', async (req, res) => {
  try {
    const { userId, recipientWallet, amountInr, phone } = req.body;
    if (!userId || !recipientWallet || !amountInr || !phone) {
      return res.status(400).json({ error: 'All transaction fields are required' });
    }
    const result = await transactionService.createTransaction(userId, {
      recipient_wallet: recipientWallet,
      amount_inr: parseFloat(amountInr),
      phone
    });
    res.json(result);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.post('/tx/execute/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { recipientWallet, amountUSDT } = req.body;
    const result = await transactionService.executeBlockchainTransaction(
      transactionId,
      recipientWallet,
      amountUSDT
    );
    res.json(result);
  } catch (error) {
    console.error('Transaction execution error:', error);
    res.status(500).json({ error: 'Failed to execute transaction' });
  }
});

// Currency Conversion
app.get('/currency/convert/:amount/:from/:to', async (req, res) => {
  try {
    const { amount, from, to } = req.params;
    if (from.toLowerCase() === 'inr' && to.toLowerCase() === 'usd') {
      const conversion = await transactionService.convertINRToUSD(parseFloat(amount));
      res.json(conversion);
    } else {
      res.status(400).json({ error: 'Only INR to USD conversion supported' });
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// Contract Routes
app.get('/contract/health', async (req, res) => {
  try {
    await contractService.connect();
    const adminAddress = await contractService.getAdminAddress();
    res.json({ 
      status: 'OK', 
      contractAddress: '0x44D5AceaB446F335853EEDebdcbE6fFD94d7d51C',
      adminAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Contract health check error:', error);
    res.status(500).json({ error: 'Contract connection failed' });
  }
});

// Calculate swap
app.post('/contract/calculate-swap', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, fromAmount } = req.body;
    if (!fromCurrency || !toCurrency || !fromAmount) {
      return res.status(400).json({ error: 'All parameters required' });
    }
    
    const result = await contractService.calculateSwap(fromCurrency, toCurrency, fromAmount);
    res.json(result);
  } catch (error) {
    console.error('Calculate swap error:', error);
    res.status(500).json({ error: 'Failed to calculate swap' });
  }
});

// Swap Fiat to USDT (admin function)
app.post('/contract/swap-fiat-to-usdt', async (req, res) => {
  try {
    const { userAddress, fromCurrency, fromAmount } = req.body;
    if (!userAddress || !fromCurrency || !fromAmount) {
      return res.status(400).json({ error: 'All parameters required' });
    }
    
    const txHash = await contractService.swapFiatToUSDT(userAddress, fromCurrency, fromAmount);
    res.json({ success: true, txHash });
  } catch (error) {
    console.error('Swap Fiat to USDT error:', error);
    res.status(500).json({ error: 'Failed to execute swap' });
  }
});

// Get user swap history
app.get('/contract/swap-history/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const history = await contractService.getUserSwapHistory(userAddress);
    res.json(history);
  } catch (error) {
    console.error('Get swap history error:', error);
    res.status(500).json({ error: 'Failed to get swap history' });
  }
});

// Get recent swaps
app.get('/contract/recent-swaps', async (req, res) => {
  try {
    const swaps = await contractService.getRecentSwaps();
    res.json(swaps);
  } catch (error) {
    console.error('Get recent swaps error:', error);
    res.status(500).json({ error: 'Failed to get recent swaps' });
  }
});

// Get currency rate
app.get('/contract/currency-rate/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const rate = await contractService.getCurrencyRate(currency);
    res.json({ currency, rate });
  } catch (error) {
    console.error('Get currency rate error:', error);
    res.status(500).json({ error: 'Failed to get currency rate' });
  }
});

// Check if currency is supported
app.get('/contract/currency-supported/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const supported = await contractService.isCurrencySupported(currency);
    res.json({ currency, supported });
  } catch (error) {
    console.error('Check currency support error:', error);
    res.status(500).json({ error: 'Failed to check currency support' });
  }
});

// Get GST rate
app.get('/contract/gst-rate', async (req, res) => {
  try {
    const rate = await contractService.getGSTRate();
    res.json({ gstRate: rate });
  } catch (error) {
    console.error('Get GST rate error:', error);
    res.status(500).json({ error: 'Failed to get GST rate' });
  }
});

// Update currency rate (admin function)
app.post('/contract/update-currency', async (req, res) => {
  try {
    const { currency, rate, supported } = req.body;
    if (!currency || !rate || supported === undefined) {
      return res.status(400).json({ error: 'All parameters required' });
    }
    
    const txHash = await contractService.updateCurrency(currency, rate, supported);
    res.json({ success: true, txHash });
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Failed to update currency' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 10MB.' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Cleanup expired OTPs hourly
setInterval(() => otpService.cleanupExpiredOTPs(), 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 KYC system ready for OTP + OCR + Transactions`);
});
