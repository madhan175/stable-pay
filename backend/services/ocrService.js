const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const geoip = require('geoip-lite');
const path = require('path');

class OCRService {
  constructor() {
    // Tesseract.js is free and doesn't require any API keys or billing
    console.log('✅ Tesseract.js OCR initialized (FREE - No billing required)');
  }

  async preprocessImage(imageBuffer) {
    try {
      // Preprocess image for better OCR accuracy
      // - Convert to grayscale
      // - Enhance contrast
      // - Resize if too large (Tesseract works better with reasonable sizes)
      const processedBuffer = await sharp(imageBuffer)
        .greyscale() // Convert to grayscale for better text detection
        .normalize() // Enhance contrast
        .sharpen() // Sharpen the image
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .png() // Convert to PNG for better quality
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async extractTextFromImage(imageBuffer, emitProgress = null) {
    try {
      if (emitProgress) emitProgress('preprocessing', 'Preprocessing image for OCR...');
      
      // Preprocess the image
      const processedBuffer = await this.preprocessImage(imageBuffer);
      
      if (emitProgress) emitProgress('extracting', 'Extracting text from document...');
      
      // Use Tesseract.js to extract text
      // For Indian documents: English + Hindi (and it will also capture Telugu, Kannada, etc. text even if not explicitly listed)
      const result = await Tesseract.recognize(
        processedBuffer,
        'eng+hin', // Support English and Hindi (will still extract other Indian languages)
        {
          logger: (info) => {
            // Report progress if callback provided
            if (emitProgress && info.status) {
              if (info.status === 'recognizing text') {
                emitProgress('recognizing', `Recognizing text... ${Math.round(info.progress * 100)}%`);
              }
            }
          }
        }
      );

      const extractedText = result.data.text.trim();

      if (!extractedText || extractedText.length === 0) {
        throw new Error('No text detected in image. Please ensure the document is clear and readable.');
      }

      if (emitProgress) emitProgress('parsing', 'Parsing extracted information...');

      // Return text in the same format as before for compatibility
      return {
        text: extractedText,
        fullTextAnnotation: {
          text: extractedText
        },
        pages: [{
          text: extractedText
        }]
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('No text detected')) {
        throw new Error('No text detected in the image. Please ensure the document is clear and readable.');
      }
      
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  parseIDData(extractedText) {
    // Handle both string and object formats
    const text = typeof extractedText === 'string' 
      ? extractedText 
      : extractedText?.text || '';
    
    // Normalize text - clean up common OCR errors
    const normalizedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[|]/g, 'I') // Common OCR error: | -> I
      .replace(/[0O]/g, (match) => {
        // Try to distinguish 0 vs O based on context
        return match; // Keep as is for now
      });
    
    // Log extracted text for debugging
    console.log('📄 Extracted text (full):', normalizedText);
    console.log('📄 Extracted text length:', normalizedText.length);
    
    const data = {
      name: null,
      dob: null,
      id_number: null,
      country: null,
      document_type: null,
      extracted_text: text,
      address: null,
      gender: null
    };

    // Detect document type first
    data.document_type = this.detectDocumentType(normalizedText);
    
    // Extract name (common patterns for Indian documents) - improved patterns
    const namePatterns = [
      // Aadhaar patterns - extract English name after Telugu/regional language text
      // Format: [Telugu text] followed by English name
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      // Aadhaar specific - name appears after regional language
      /[^\w]([A-Z][a-zA-Z]{2,}\s+[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})?)\s*(?:\n|$|DOB|Date|पुट्टिन|పుట్టిన)/i,
      // Standard Aadhaar patterns
      /(?:Name|नाम|పేరు)[:\s]*([A-Za-z\s\.]{3,50})/i,
      /(?:Full Name|पूरा नाम|పూర్తి పేరు)[:\s]*([A-Za-z\s\.]{3,50})/i,
      /(?:Given Name|पहला नाम)[:\s]*([A-Za-z\s\.]{3,50})/i,
      // PAN patterns - improved
      /([A-Z]{5}[0-9]{4}[A-Z]{1})[\s\n]+([A-Z\s]{10,50})/,
      /([A-Z]{5}[0-9]{4}[A-Z]{1})\s+([A-Z\s]{10,50})/,
      // Passport patterns
      /(?:Surname|Family Name|Last Name)[:\s]*([A-Za-z\s]+)/i,
      /(?:Given Name|First Name)[:\s]*([A-Za-z\s]+)/i,
      // Generic patterns
      /Name[:\s]+([A-Za-z\s\.]{3,50})/i,
      // Extract proper case names (First Middle Last) - improved
      /\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/,
      /\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/
    ];

    for (const pattern of namePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        const name = (match[1] || match[2] || '').trim();
        if (name && name.length >= 3 && !name.match(/^\d+$/) && name.split(' ').length >= 1) {
          data.name = name.substring(0, 100); // Limit length
          console.log('✅ Extracted name:', data.name);
          break;
        }
      }
    }

    // Extract date of birth (Indian formats: DD/MM/YYYY, DD-MM-YYYY) - improved patterns
    const dobPatterns = [
      // Aadhaar specific format: "పుట్టిన తేదీ / DOB : 12/07/2006" or "DOB : 12/07/2006"
      /(?:DOB|Date\s+of\s+Birth|जन्म\s+तिथि|పుట్టిన\s+తేదీ|Birth|Born)[:\s\/]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
      // More flexible with spacing
      /(?:DOB|Date\s+of\s+Birth|जन्म\s+तिथि|పుట్టిన\s+తేదీ)[:\s]*(\d{1,2}[\/\-\s\.]\d{1,2}[\/\-\s\.]\d{2,4})/i,
      // Standalone date patterns in DD/MM/YYYY format (common in Aadhaar)
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/,
      // Also handle YYYY/MM/DD
      /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
      // Year only patterns
      /(?:Year\s+of\s+Birth|जन्म\s+वर्ष|Born)[:\s]*(\d{4})/i,
      /(?:Birth\s+Year)[:\s]*(\d{4})/i,
      // More flexible date formats with dots or spaces
      /(\d{1,2})[\/\-\s\.](\d{1,2})[\/\-\s\.](\d{2,4})/
    ];

    for (const pattern of dobPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        let date;
        if (match.length === 2 && match[1].length === 4) {
          // Year only
          const year = parseInt(match[1]);
          if (year >= 1900 && year <= new Date().getFullYear()) {
            date = new Date(year, 0, 1);
          }
        } else if (match.length >= 4) {
          // Full date with components
          const dateStr = `${match[1]}/${match[2]}/${match[3]}`;
          date = this.parseDate(dateStr);
        } else {
          // Try to parse the matched string
          date = this.parseDate(match[0]);
        }
        if (date && this.isValidAge(date)) {
          data.dob = date.toISOString().split('T')[0];
          console.log('✅ Extracted DOB:', data.dob);
          break;
        }
      }
    }

    // Extract ID number (Indian documents) - improved patterns for Aadhaar
    // Words to exclude (common OCR mistakes or document text)
    const excludeWords = ['entity', 'identity', 'government', 'government of india', 'bharat sarkar', 'meant', 'meri', 'pehchan'];
    
    const idPatterns = [
      // Pattern 1: Most common format - exactly "7648 3300 0565" (4 digits, space, 4 digits, space, 4 digits)
      // This is the MOST COMMON format on Aadhaar cards (HIGHEST PRIORITY)
      /([0-9]{4}\s+[0-9]{4}\s+[0-9]{4})/,
      // Pattern 2: Explicitly labeled Aadhaar number
      /(?:Aadhaar|आधार|Aadhar|UID|Aadhaar\s+No|Aadhaar\s+Number)[:\s\w]*([0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4})/i,
      // Pattern 3: 12 digits with any separator (spaces, hyphens, dots)
      /([0-9]{4}[\s\-\.][0-9]{4}[\s\-\.][0-9]{4})/,
      // Pattern 4: 12 consecutive digits (no spaces)
      /([0-9]{12})/,
      // PAN (5 letters, 4 digits, 1 letter) - handle OCR errors
      /(?:PAN|पैन|Permanent\s+Account\s+Number)[:\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})/i,
      /([A-Z]{5}[0-9]{4}[A-Z]{1})/,
      // Passport - more flexible
      /(?:Passport|पासपोर्ट|Passport\s+No)[:\s]*([A-Z0-9]{6,12})/i,
      // Voter ID
      /(?:Voter\s+ID|मतदाता\s+आईडी|EPIC)[:\s]*([A-Z0-9]{6,12})/i,
      // Generic ID patterns (but exclude common words)
      /(?:ID|Number|नंबर|No\.?)[:\s]*([A-Z0-9]{6,15})/i,
      // Standalone long alphanumeric (likely ID) - but exclude words
      /\b([A-Z]{2,5}[0-9]{4,}[A-Z0-9]{0,5})\b/,
      // Other digit sequences (but prefer 12 digits)
      /\b([0-9]{10,11})\b/
    ];

    for (const pattern of idPatterns) {
      // Create a global version of the pattern for finding all matches
      const globalPattern = new RegExp(pattern.source, (pattern.flags || '') + 'g');
      let match;
      let matchCount = 0;
      
      // Find all matches using exec() (handles capture groups correctly)
      while ((match = globalPattern.exec(normalizedText)) !== null) {
        matchCount++;
        // Use captured group (match[1]) if available, otherwise use full match (match[0])
        const matchedText = match[1] || match[0];
        
        if (matchCount === 1) {
          console.log(`🔎 Pattern ${pattern.source} found matches...`);
        }
        
        // Clean the match: remove all spaces, hyphens, dots
        let id = matchedText.replace(/[\s\-\.]+/g, '').trim();
        
        // Convert to lowercase for comparison
        const idLower = id.toLowerCase();
        
        // Exclude common words that aren't ID numbers
        const shouldExclude = excludeWords.some(word => idLower === word || idLower.includes(word));
        if (shouldExclude) {
          console.log(`⚠️ Skipping invalid ID match: "${id}" (from "${matchedText}")`);
          continue; // Skip this match, try next
        }
        
        // For Aadhaar: must be exactly 12 digits after cleaning
        if (/^[0-9]{12}$/.test(id)) {
          // Perfect! 12-digit Aadhaar number
          data.id_number = id;
          console.log(`✅ Extracted Aadhaar number: ${data.id_number} (from match: "${matchedText}")`);
          break; // Found it! Exit the loop
        } else {
          console.log(`ℹ️ Pattern match "${matchedText}" -> cleaned: "${id}" (length: ${id.length}, valid: ${/^[0-9]{12}$/.test(id)})`);
        }
      }
      
      // If we found a valid Aadhaar, stop searching
      if (data.id_number && data.id_number.length === 12) {
        break;
      }
    }
    
    // If document is Aadhaar but we didn't find 12-digit number, try harder
    if (data.document_type === 'Aadhaar Card' && (!data.id_number || data.id_number.length !== 12)) {
      console.log('🔍 Aadhaar detected but ID not found. Searching more thoroughly...');
      
      // Find potential Aadhaar number positions in text
      const aadhaarKeywords = ['7648', '3300', '0565', 'aadhaar', 'आधार'];
      let searchArea = normalizedText;
      for (const keyword of aadhaarKeywords) {
        const index = normalizedText.toLowerCase().indexOf(keyword.toLowerCase());
        if (index !== -1) {
          searchArea = normalizedText.substring(Math.max(0, index - 100), Math.min(normalizedText.length, index + 200));
          console.log(`📝 Found keyword "${keyword}" at position ${index}. Searching area:`, searchArea);
          break;
        }
      }
      
      // Look for patterns that might be Aadhaar numbers with OCR errors
      // Pattern 1: Look for sequences that look like Aadhaar (4-4-4 digits)
      const patternsToTry = [
        // Standard: 7648 3300 0565 or 7648-3300-0565
        /\b([0-9]{4}[\s\-\.]{1,2}[0-9]{4}[\s\-\.]{1,2}[0-9]{4})\b/g,
        // With OCR errors: might have letters instead of numbers
        /\b([0-9OIl]{4}[\s\-\.]{1,2}[0-9OIl]{4}[\s\-\.]{1,2}[0-9OIl]{4})\b/gi,
        // Any 12 consecutive digits (might not have spaces)
        /([0-9]{12})/g,
        // Look for 3 groups of 4 digits anywhere
        /([0-9]{4}\s+[0-9]{4}\s+[0-9]{4})/g,
        // More flexible: any combination of digits with separators
        /([0-9]{3,4}[^\w]{0,2}[0-9]{3,4}[^\w]{0,2}[0-9]{3,4})/g
      ];
      
      let foundAadhaar = null;
      
      // Search both in the specific area and the full text
      const textsToSearch = [searchArea, normalizedText];
      
      for (const textToSearch of textsToSearch) {
        for (const pattern of patternsToTry) {
          // Reset regex lastIndex for global patterns
          if (pattern.global) {
            pattern.lastIndex = 0;
          }
          const matches = textToSearch.match(pattern);
          if (matches && matches.length > 0) {
            console.log(`🔎 Trying pattern ${pattern} in ${textToSearch === searchArea ? 'search area' : 'full text'}: Found ${matches.length} matches`, matches.slice(0, 5));
            for (const match of matches) {
              // Clean the match: replace OCR errors
              let cleaned = match
                .replace(/[^\dOIl]/gi, '') // Keep digits and common OCR errors
                .replace(/O/gi, '0') // OCR: O -> 0
                .replace(/I/gi, '1') // OCR: I -> 1
                .replace(/l/gi, '1') // OCR: l -> 1
                .replace(/S/gi, '5') // OCR: S -> 5
                .replace(/Z/gi, '2'); // OCR: Z -> 2
              
              // Check if it's exactly 12 digits
              if (cleaned.length === 12 && /^[0-9]{12}$/.test(cleaned)) {
                const shouldExclude = excludeWords.some(word => cleaned.toLowerCase().includes(word));
                if (!shouldExclude) {
                  foundAadhaar = cleaned;
                  console.log(`✅ Found potential Aadhaar number: ${foundAadhaar} (from match: "${match}")`);
                  break;
                } else {
                  console.log(`⚠️ Excluded match "${match}" -> "${cleaned}" (matches exclusion list)`);
                }
              } else if (cleaned.length > 0) {
                console.log(`ℹ️ Match "${match}" cleaned to "${cleaned}" (length: ${cleaned.length}, valid: ${/^[0-9]{12}$/.test(cleaned)})`);
              }
            }
            if (foundAadhaar) break;
          }
        }
        if (foundAadhaar) break;
      }
      
      if (foundAadhaar) {
        data.id_number = foundAadhaar;
        console.log('✅ Final Aadhaar number extracted:', data.id_number);
      } else {
        // Last resort: search the entire text for any 12-digit sequences
        console.log('🔍 Last resort: Searching entire text for 12-digit sequences...');
        const all12DigitMatches = normalizedText.match(/[0-9OIl]{12,}/gi);
        if (all12DigitMatches) {
          for (const match of all12DigitMatches) {
            let cleaned = match
              .replace(/[^\dOIl]/gi, '')
              .replace(/O/gi, '0')
              .replace(/I/gi, '1')
              .replace(/l/gi, '1');
            if (cleaned.length === 12 && /^[0-9]{12}$/.test(cleaned)) {
              const shouldExclude = excludeWords.some(word => cleaned.toLowerCase().includes(word));
              if (!shouldExclude) {
                data.id_number = cleaned;
                console.log('✅ Found Aadhaar in last resort search:', data.id_number);
                break;
              }
            }
          }
        }
      }
      
      // Log the extracted text around common Aadhaar number positions for debugging
      if (!data.id_number || data.id_number.length !== 12) {
        console.log('⚠️ Could not find Aadhaar number. Extracted text sample:', normalizedText.substring(0, 800));
        console.log('⚠️ Look for patterns like: 7648 3300 0565 or similar 12-digit numbers in the text above');
      }
    }

    // Extract address (for Aadhaar)
    const addressPatterns = [
      /(?:Address|पता)[:\s]*([^\n]{10,100})/i,
      /([A-Za-z0-9\s,\.-]{20,100})/ // Generic address pattern
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && !data.name) { // Avoid matching name
        data.address = match[1].trim();
        break;
      }
    }

    // Extract gender
    const genderPatterns = [
      /(?:Gender|लिंग)[:\s]*(Male|Female|M|F|पुरुष|महिला)/i
    ];

    for (const pattern of genderPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.gender = match[1];
        break;
      }
    }

    // Extract country (default to India for Indian documents)
    data.country = this.detectCountry(text);
    if (!data.country && (data.document_type === 'Aadhaar' || data.document_type === 'PAN')) {
      data.country = 'IN';
    }

    return data;
  }

  detectDocumentType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('aadhaar') || lowerText.includes('आधार') || lowerText.includes('uidai')) {
      return 'Aadhaar Card';
    }
    if (lowerText.includes('permanent account number') || lowerText.includes('income tax') || /PAN/.test(text)) {
      return 'PAN Card';
    }
    if (lowerText.includes('passport') || lowerText.includes('पासपोर्ट')) {
      return 'Passport';
    }
    if (lowerText.includes('voter') || lowerText.includes('elector') || lowerText.includes('मतदाता')) {
      return 'Voter ID';
    }
    if (lowerText.includes('driving') || lowerText.includes('license') || lowerText.includes('ड्राइविंग')) {
      return 'Driving License';
    }
    
    return 'National ID';
  }

  parseDate(dateStr) {
    try {
      // Handle different date formats
      const formats = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/   // MM/DD/YY or DD/MM/YY
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          let [, month, day, year] = match;
          
          // Convert 2-digit year to 4-digit
          if (year.length === 2) {
            year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
          }

          // Try both MM/DD/YYYY and DD/MM/YYYY
          const date1 = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
          const date2 = new Date(`${year}-${day.padStart(2, '0')}-${month.padStart(2, '0')}`);
          
          // Return the date that makes more sense (not in future, reasonable age)
          if (date1.getTime() <= Date.now() && this.isValidAge(date1)) {
            return date1;
          }
          if (date2.getTime() <= Date.now() && this.isValidAge(date2)) {
            return date2;
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  isValidAge(date) {
    const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 18 && age <= 120; // Reasonable age range
  }

  detectCountry(text) {
    const countryKeywords = {
      'IN': ['india', 'indian', 'aadhaar', 'pan', 'bharat'],
      'US': ['usa', 'united states', 'america', 'american'],
      'GB': ['uk', 'united kingdom', 'britain', 'british'],
      'CA': ['canada', 'canadian'],
      'AU': ['australia', 'australian'],
      'DE': ['germany', 'german', 'deutschland'],
      'FR': ['france', 'french', 'français'],
      'JP': ['japan', 'japanese'],
      'CN': ['china', 'chinese'],
      'BR': ['brazil', 'brazilian']
    };

    const lowerText = text.toLowerCase();
    
    for (const [country, keywords] of Object.entries(countryKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return country;
        }
      }
    }

    return null;
  }

  async detectCountryFromIP(ip) {
    try {
      const geo = geoip.lookup(ip);
      return geo ? geo.country : null;
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  }

  validateKYCDocument(ocrData) {
    const errors = [];
    const warnings = [];

    // Critical fields - must be present
    if (!ocrData.name || ocrData.name.length < 2) {
      errors.push('Name not found or invalid');
    }

    // Warning fields - can be entered manually
    if (!ocrData.dob) {
      warnings.push('Date of birth not found - please enter manually');
    }

    if (!ocrData.id_number || ocrData.id_number.length < 3) {
      warnings.push('ID number not found - please enter manually');
    }

    // Country can be defaulted
    if (!ocrData.country) {
      // Default to India if document type suggests it
      if (ocrData.document_type && (ocrData.document_type.includes('Aadhaar') || ocrData.document_type.includes('PAN'))) {
        ocrData.country = 'IN';
      } else {
        warnings.push('Country not detected - will use default');
      }
    }

    // Only fail if critical fields are missing
    // Warnings allow manual entry during verification
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresManualEntry: warnings.length > 0
    };
  }
}

module.exports = new OCRService();
