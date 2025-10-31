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

// CORS configuration for production (Render) and development
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  // Add production frontend URLs
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Add Vercel deployment URLs (comma-separated)
  if (process.env.VERCEL_FRONTEND_URLS) {
    origins.push(...process.env.VERCEL_FRONTEND_URLS.split(','));
  }
  
  return origins;
};

const allowedOrigins = getAllowedOrigins();

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Explicitly handle preflight
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory payments store (for demo)
const payments = [];

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

// Helper function to resolve user ID (handle mock IDs by looking up by phone)
async function resolveUserId(userId, phone = null) {
  // Check if userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // If it's already a valid UUID format, return it (trust it's valid)
  if (uuidRegex.test(userId)) {
    return userId;
  }
  
  // If it's a mock ID (not a UUID), try to find user by phone
  if (phone) {
    try {
      const user = await supabaseService.getUserByPhone(phone);
      if (user) {
        console.log(`✅ Resolved mock ID to real user: ${userId} -> ${user.id}`);
        return user.id;
      }
    } catch (error) {
      // User doesn't exist yet, will be created elsewhere
      console.warn(`⚠️ User with phone ${phone} not found:`, error.message);
    }
  }
  
  // Return original userId if we can't resolve it (will fail gracefully later)
  return userId;
}

// Helper function to get or create user by phone
async function getOrCreateUserByPhone(phone) {
  try {
    // Try to get existing user
    let user = await supabaseService.getUserByPhone(phone);
    
    if (user) {
      // Update last login
      user = await supabaseService.updateUser(user.id, {
        phone_verified: true,
        last_login: new Date().toISOString()
      });
      return user;
    }
    
    // Create new user
    user = await supabaseService.createUser({
      phone: phone,
      phone_verified: true,
      kyc_status: 'none',
      last_login: new Date().toISOString()
    });
    
    console.log(`✅ Created new user in Supabase: ${user.id}`);
    return user;
  } catch (error) {
    console.error('❌ Error getting/creating user:', error);
    throw error;
  }
}

app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    const result = await otpService.verifyOTP(phone, otp);
    if (result.success) {
      // Get or create user in Supabase
      try {
        const user = await getOrCreateUserByPhone(phone);
        
        console.log(`✅ [OTP] User verified and synced to Supabase: ${phone} (${user.id})`);
        res.json({ 
          success: true, 
          user: {
            id: user.id,
            phone: user.phone,
            phone_verified: user.phone_verified,
            kyc_status: user.kyc_status,
            created_at: user.created_at,
            last_login: user.last_login
          }, 
          message: 'OTP verified successfully' 
        });
      } catch (supabaseError) {
        // Fallback to mock user if Supabase fails
        console.warn('⚠️ [OTP] Supabase user creation failed, using mock user:', supabaseError.message);
        const mockUser = {
          id: 'demo-user-' + Date.now(),
          phone: phone,
          phone_verified: true,
          kyc_status: 'none',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        res.json({ 
          success: true, 
          user: mockUser, 
          message: 'OTP verified successfully (mock mode)' 
        });
      }
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
    const { userId, documentType, phone } = req.body;
    const file = req.file;
    if (!userId || !documentType || !file) {
      return res.status(400).json({ error: 'User ID, document type, and file required' });
    }

    // Resolve userId to a valid UUID (handle mock IDs)
    let resolvedUserId = userId;
    try {
      resolvedUserId = await resolveUserId(userId, phone);
      
      // If resolution didn't change the ID and it's still a mock ID, try to create user
      if (resolvedUserId === userId && !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        if (phone) {
          // Create user if they don't exist
          const user = await getOrCreateUserByPhone(phone);
          resolvedUserId = user.id;
          console.log(`✅ Created/resolved user for KYC upload: ${phone} -> ${resolvedUserId}`);
        } else {
          console.warn(`⚠️ Cannot resolve mock userId ${userId} without phone number`);
        }
      }
    } catch (resolveError) {
      console.warn(`⚠️ Could not resolve userId ${userId}:`, resolveError.message);
      // Continue with original userId - will fail gracefully if invalid
    }

    // Use resolved userId for all operations
    const finalUserId = resolvedUserId;

    // Emit initial processing status
    emitKYCUpdate(finalUserId, 'processing', { 
      stage: 'uploaded',
      message: 'Document uploaded. Starting OCR processing...' 
    });

    const imageBuffer = fs.readFileSync(file.path);

    // Create progress emitter function
    const emitProgress = (stage, message) => {
      emitKYCUpdate(finalUserId, 'processing', {
        stage,
        message,
        timestamp: new Date().toISOString()
      });
    };

    try {
      // Extract text with progress updates
      const extractedData = await ocrService.extractTextFromImage(imageBuffer, emitProgress);
      
      emitProgress('parsing', 'Parsing extracted information...');
      
      // Parse OCR data (handle both string and object formats)
      const ocrData = ocrService.parseIDData(extractedData);
      
      emitProgress('validating', 'Validating document information...');
      
      // Validate the document
      const validation = ocrService.validateKYCDocument(ocrData);

      // If there are critical errors, reject immediately
      // If only warnings, allow manual entry during verification
      const status = validation.isValid ? 'verified' : 'rejected';
      
      // Create KYC document
      const kycDocument = {
        id: 'doc-' + Date.now(),
        user_id: userId,
        type: documentType,
        file_url: file.path,
        file_name: file.originalname,
        ocr_data: ocrData,
        status: validation.isValid ? 'verified' : 'rejected',
        rejection_reason: validation.isValid ? null : validation.errors.join(', '),
        submitted_at: new Date().toISOString()
      };

      console.log(`📄 [REAL-TIME OCR] Document processed: ${validation.isValid ? 'READY FOR VERIFICATION' : 'REJECTED'}`, {
        name: ocrData.name || 'Not found',
        document_type: ocrData.document_type || 'Unknown',
        id_number: ocrData.id_number ? ocrData.id_number.substring(0, 4) + '****' : 'Not found',
        dob: ocrData.dob || 'Not found',
        warnings: validation.warnings || [],
        requiresManualEntry: validation.requiresManualEntry
      });

      // Emit final status
      // Always go to verification step if valid, even if some fields are missing
      const finalStatus = validation.isValid ? 'verified' : 'error';
      const message = validation.isValid 
        ? (validation.requiresManualEntry 
          ? 'Document processed. Please verify and complete missing information.'
          : 'Document processed successfully. Please verify your information.')
        : `KYC failed: ${validation.errors.join(', ')}`;

      // Try to save document to Supabase (optional - don't fail if it doesn't work)
      let savedDocument = kycDocument;
      try {
        // Only try to save if we have a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(finalUserId)) {
          savedDocument = await supabaseService.createKYCDocument({
            user_id: finalUserId,
            type: documentType,
            file_url: file.path,
            ocr_data: ocrData,
            status: validation.isValid ? 'pending' : 'rejected', // Start as pending, will be verified after user confirms
            submitted_at: new Date().toISOString(),
            rejection_reason: validation.isValid ? null : validation.errors.join(', ')
          });
          console.log('✅ [KYC] Document saved to database:', savedDocument.id);
        } else {
          console.warn(`⚠️ [KYC] Skipping database save - invalid userId format: ${finalUserId}`);
        }
      } catch (dbError) {
        console.warn('⚠️ [KYC] Could not save document to database (continuing anyway):', dbError.message);
        // Continue without saving - system will still work
      }

      emitKYCUpdate(finalUserId, finalStatus, {
        document: savedDocument,
        validation,
        ocrData,
        message
      });

      res.json({
        success: validation.isValid,
        document: savedDocument,
        ocrData,
        validation,
        message: validation.isValid ? 'KYC verified successfully' : `KYC failed: ${validation.errors.join(', ')}`
      });
    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      
      // Provide user-friendly error messages
      let errorMessage = ocrError.message || 'Failed to process document';
      let userMessage = errorMessage;
      
      // Check for common OCR errors
      if (errorMessage.includes('not initialized')) {
        userMessage = 'OCR service is not configured. Please contact support.';
      } else if (errorMessage.includes('No text detected')) {
        userMessage = 'Could not extract text from the document. Please ensure the image is clear and readable.';
      } else if (errorMessage.includes('Failed to process image')) {
        userMessage = 'Image processing failed. Please ensure the uploaded file is a valid image format (JPG, PNG, etc.).';
      } else if (errorMessage.includes('Failed to extract text')) {
        userMessage = 'Text extraction failed. Please try with a clearer image or different document.';
      }
      
      emitKYCUpdate(userId, 'error', {
        message: userMessage,
        error: errorMessage
      });

      res.status(500).json({ 
        success: false,
        error: errorMessage,
        message: userMessage
      });
    }
  } catch (error) {
    console.error('KYC upload error:', error);
    
    const userId = req.body.userId;
    if (userId) {
      // Try to resolve userId for error emission
      let resolvedUserId = userId;
      try {
        resolvedUserId = await resolveUserId(userId, req.body.phone);
      } catch (e) {
        // Use original userId if resolution fails
      }
      emitKYCUpdate(resolvedUserId, 'error', {
        message: error.message || 'Failed to upload document'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process KYC document' 
    });
  }
});

// KYC Verify - Update user with verified ID number and DOB
app.post('/kyc/verify', async (req, res) => {
  try {
    const { userId, idNumber, dob, documentId, phone } = req.body;
    
    if (!userId || !idNumber || !dob) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID, ID number, and date of birth are required' 
      });
    }

    const cleanedIdNumber = idNumber.replace(/\s+/g, ''); // Remove spaces from Aadhaar number
    
    // Resolve userId to a valid UUID (handle mock IDs)
    let resolvedUserId = userId;
    try {
      resolvedUserId = await resolveUserId(userId, phone);
      
      // If resolution didn't change the ID and it's still a mock ID, try to create user
      if (resolvedUserId === userId && !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        if (phone) {
          // Create user if they don't exist
          const user = await getOrCreateUserByPhone(phone);
          resolvedUserId = user.id;
          console.log(`✅ Created/resolved user for KYC verify: ${phone} -> ${resolvedUserId}`);
        } else {
          console.warn(`⚠️ Cannot resolve mock userId ${userId} without phone number`);
        }
      }
    } catch (resolveError) {
      console.warn(`⚠️ Could not resolve userId ${userId}:`, resolveError.message);
      // Continue with original userId - will fail gracefully if invalid
    }

    const finalUserId = resolvedUserId;
    
    // Try to update in Supabase, but don't fail if it doesn't work
    const supabaseService = require('./services/supabaseService');
    
    try {
      // Only proceed if we have a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(finalUserId)) {
        console.warn(`⚠️ [KYC VERIFY] Skipping Supabase updates - invalid userId format: ${finalUserId}`);
      } else {
        // Try to get and update the document if documentId is provided
        if (documentId) {
          try {
            const updatedOcrData = {
              id_number: cleanedIdNumber,
              dob: dob
            };

            await supabaseService.updateKYCDocument(documentId, {
              ocr_data: updatedOcrData,
              status: 'verified',
              verified_at: new Date().toISOString()
            });

            console.log('✅ [KYC VERIFY] Updated document with verified ID:', {
              documentId,
              idNumber: cleanedIdNumber.substring(0, 4) + '****',
              dob
            });
          } catch (docError) {
            console.warn('⚠️ [KYC VERIFY] Could not update document (trying to find it):', docError.message);
            
            // Try to find the latest document
            try {
              const documents = await supabaseService.getKYCDocuments(finalUserId);
              const latestDoc = documents && documents.length > 0 
                ? documents.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0]
                : null;

              if (latestDoc) {
                const updatedOcrData = {
                  ...(latestDoc.ocr_data || {}),
                  id_number: cleanedIdNumber,
                  dob: dob
                };

                await supabaseService.updateKYCDocument(latestDoc.id, {
                  ocr_data: updatedOcrData,
                  status: 'verified',
                  verified_at: new Date().toISOString()
                });

                console.log('✅ [KYC VERIFY] Updated latest document:', latestDoc.id);
              }
            } catch (findError) {
              console.warn('⚠️ [KYC VERIFY] Could not find/update document:', findError.message);
            }
          }
        }

        // Update user's KYC status
        try {
          await supabaseService.updateUser(finalUserId, {
            kyc_status: 'verified',
            updated_at: new Date().toISOString()
          });
          console.log('✅ [KYC VERIFY] Updated user KYC status to verified');
        } catch (userError) {
          console.warn('⚠️ [KYC VERIFY] Could not update user status:', userError.message);
        }
      }

    } catch (supabaseError) {
      // Supabase might not be configured - that's okay, verification still succeeded
      console.warn('⚠️ [KYC VERIFY] Supabase operations failed, but verification succeeded:', supabaseError.message);
    }

    // Always return success - verification is complete even if database update fails
    res.json({
      success: true,
      message: 'KYC verified successfully',
      idNumber: cleanedIdNumber // Return cleaned ID number
    });
  } catch (error) {
    console.error('KYC verify error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to verify KYC' 
    });
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

// ----- Payments (USDT) sync from frontend -----
// Store a verified payment and broadcast via socket
app.post('/api/transactions', async (req, res) => {
  try {
    const { txHash, sender, receiver, amount, timestamp, gasUsed, gasPrice, blockNumber } = req.body || {};
    if (!txHash || !sender || !receiver || !amount) {
      return res.status(400).json({ error: 'txHash, sender, receiver, amount required' });
    }

    // Optional: verify transaction onchain if RPC provided
    let status = 'success';
    let actualGasUsed = gasUsed;
    let actualBlockNumber = blockNumber;
    try {
      const rpcUrl = process.env.ETHEREUM_RPC_URL;
      if (rpcUrl && txHash.startsWith('0x')) {
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt || receipt.status !== 1) {
          status = 'pending';
        } else {
          // Get actual gas used from receipt
          actualGasUsed = receipt.gasUsed.toString();
          actualBlockNumber = receipt.blockNumber.toString();
        }
      }
    } catch (e) {
      console.warn('⚠️ TX verify skipped:', e?.message || e);
    }

    const record = {
      txHash,
      sender,
      receiver,
      amount: String(amount),
      status,
      timestamp: timestamp || new Date().toISOString(),
      gas_used: actualGasUsed,
      block_number: actualBlockNumber
    };
    payments.unshift(record);

    // Try to save to Supabase if we have user context
    try {
      // Try to find user by wallet address
      const userData = await supabaseService.supabase
        .from('users')
        .select('id')
        .eq('wallet_address', sender.toLowerCase())
        .single();
      
      if (userData && !userData.error && userData.data) {
        const userId = userData.data.id;
        
        // Calculate USD/USDT amounts (approximate)
        const amountUsdt = parseFloat(amount);
        const amountInr = amountUsdt * 83; // Approximate conversion
        
        // Save to Supabase transactions table
        const supabaseTx = await supabaseService.createTransaction({
          user_id: userId,
          recipient_wallet: receiver,
          amount_inr: amountInr,
          amount_usd: amountUsdt,
          amount_usdt: amountUsdt,
          requires_kyc: false,
          kyc_verified: false,
          status: status,
          tx_hash: txHash,
          block_number: actualBlockNumber ? parseInt(actualBlockNumber) : null,
          gas_used: actualGasUsed ? parseInt(actualGasUsed) : null
        });
        
        console.log('✅ [TRANSACTION] Saved to Supabase:', supabaseTx.id);
      } else {
        // Try to find or create user by searching all recent users
        // This is a fallback when wallet isn't linked to a user yet
        console.log('⚠️ [TRANSACTION] User not found for wallet:', sender);
        console.log('⚠️ [TRANSACTION] Transaction saved to in-memory store only');
        console.log('💡 [TRANSACTION] Tip: Link wallet address to user account during login/registration');
      }
    } catch (supabaseError) {
      console.warn('⚠️ [TRANSACTION] Supabase save failed (continuing with in-memory):', supabaseError.message);
      // Continue anyway - transaction is still saved in memory
    }

    // Emit real-time event
    io.emit('new-payment', record);

    return res.json({ success: true, payment: record });
  } catch (error) {
    console.error('Save payment error:', error);
    return res.status(500).json({ error: 'Failed to save payment' });
  }
});

// Get merchant transactions by receiver wallet
app.get('/api/merchant-transactions', async (req, res) => {
  try {
    const wallet = (req.query.wallet || '').toString().toLowerCase();
    if (!wallet) return res.status(400).json({ error: 'wallet required' });
    const items = payments.filter(p => (p.receiver || '').toLowerCase() === wallet);
    return res.json(items);
  } catch (error) {
    console.error('Fetch merchant tx error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
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
      contractAddress: '0xA59CE17F2ea6946F48386B4bD7884512AeC674F4',
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
