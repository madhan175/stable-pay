# Real-Time KYC OCR Setup Guide

## Overview
This implementation provides real-time KYC document processing using Google Cloud Vision API with Socket.IO for live progress updates.

## Features Implemented
✅ Real-time OCR processing with Google Cloud Vision API
✅ Socket.IO for live progress updates
✅ Enhanced document parsing for Indian documents (Aadhaar, PAN, Passport)
✅ Progress indicators in the UI
✅ Better error handling and validation

## Setup Instructions

### 1. Google Cloud Vision API Credentials

**Important**: The file `client_secret_81825525579-tms8bs0cf6nr9f38ia2k4v8l6bm41h99.apps.googleusercontent.com.json` is an OAuth client secret file. For Google Cloud Vision API, you typically need a **Service Account Key** JSON file instead.

#### Option A: Use Service Account Key (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Create a new service account or use an existing one
4. Create a JSON key for the service account
5. Download the key file and save it in the `backend/` folder
6. Update `.env` with the filename:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=your-service-account-key.json
   ```

#### Option B: Use OAuth Credentials (If configured)
If you have configured OAuth credentials properly with Vision API access, the current setup will attempt to use them. However, Service Account keys are recommended for server-side usage.

### 2. Environment Variables

Create a `.env` file in the `backend/` folder with:

```env
# Google Cloud Vision API
GOOGLE_APPLICATION_CREDENTIALS=client_secret_81825525579-tms8bs0cf6nr9f38ia2k4v8l6bm41h99.apps.googleusercontent.com.json
GOOGLE_CLOUD_PROJECT_ID=gen-lang-client-0534376001

# Or if using Service Account Key:
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
# GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

Ensure these packages are installed:
- `@google-cloud/vision`
- `sharp`
- `socket.io`

### 4. Start the Backend Server

```bash
cd backend
npm start
# or for development:
npm run dev
```

The server will log:
- ✅ `Google Cloud Vision API client initialized` if credentials are valid
- ⚠️ Warnings if credentials are missing or invalid

### 5. Start the Frontend

```bash
npm install
npm run dev
```

## How It Works

### Backend Flow
1. Document is uploaded via `/kyc/upload` endpoint
2. Server emits "processing" status via Socket.IO
3. Image is preprocessed (resize, sharpen, normalize)
4. Google Cloud Vision API extracts text (with progress updates)
5. Extracted text is parsed for:
   - Name
   - Date of Birth
   - ID Number (Aadhaar, PAN, etc.)
   - Document Type
   - Country
6. Document is validated
7. Final status ("verified" or "rejected") is emitted via Socket.IO

### Frontend Flow
1. User drops/uploads a document
2. Document is sent to backend API
3. Socket.IO connection receives real-time updates:
   - "uploaded" → "preprocessing" → "extracting" → "parsing" → "validating"
4. UI shows progress with current stage
5. Success or error status is displayed
6. Extracted OCR data is shown to user

## Supported Documents
- ✅ Aadhaar Card (India)
- ✅ PAN Card (India)
- ✅ Passport
- ✅ Voter ID
- ✅ Driving License
- ✅ Generic National ID

## Document Parsing Features
- Name extraction (supports Hindi and English)
- Date of Birth parsing (DD/MM/YYYY, MM/DD/YYYY formats)
- ID number extraction (12-digit Aadhaar, PAN format, etc.)
- Document type detection
- Country detection (defaults to India for Indian documents)
- Address extraction (for Aadhaar)
- Gender extraction

## Real-Time Updates

The system uses Socket.IO to provide live updates:
- **Stage**: Current processing stage (uploaded, preprocessing, extracting, parsing, validating)
- **Message**: Human-readable status message
- **Status**: Final status (processing, verified, rejected, error)

## Troubleshooting

### "Google Cloud Vision API client not initialized"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` points to a valid file
- Ensure the file is a valid JSON service account key
- Verify the file path is correct (relative to backend folder)

### "Permission denied" error
- Ensure the service account has "Cloud Vision API User" role
- Enable Cloud Vision API in your Google Cloud project

### "No text detected in image"
- Ensure the document image is clear and readable
- Try a higher resolution image
- Check if the document has sufficient contrast

### Socket.IO not connecting
- Verify backend server is running on port 5000
- Check CORS settings in `server.js`
- Ensure `VITE_API_URL` is set correctly in frontend `.env`

## API Endpoints

### POST `/kyc/upload`
Uploads a KYC document for OCR processing.

**Request:**
- `document`: File (multipart/form-data)
- `userId`: String
- `documentType`: String

**Response:**
```json
{
  "success": true,
  "document": { ... },
  "ocrData": {
    "name": "...",
    "dob": "YYYY-MM-DD",
    "id_number": "...",
    "document_type": "...",
    "country": "IN"
  },
  "validation": {
    "isValid": true,
    "errors": []
  }
}
```

## Socket.IO Events

### Client → Server
- `join_kyc_room`: Join room for KYC updates
- `kyc_error`: Report KYC error (optional)

### Server → Client
- `kyc_update`: Real-time KYC processing updates
  ```json
  {
    "status": "processing|verified|rejected|error",
    "stage": "uploaded|preprocessing|extracting|parsing|validating",
    "message": "Human-readable message",
    "data": { ... }
  }
  ```

## Next Steps

1. ✅ Configure Google Cloud Service Account Key
2. ✅ Set up environment variables
3. ✅ Test with a sample document
4. ⚠️ Consider adding document image quality validation
5. ⚠️ Consider adding liveness detection for selfies
6. ⚠️ Add document tampering detection
