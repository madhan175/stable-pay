const vision = require('@google-cloud/vision');
const sharp = require('sharp');
const geoip = require('geoip-lite');

class OCRService {
  constructor() {
    this.client = new vision.ImageAnnotatorClient();
  }

  async preprocessImage(imageBuffer) {
    try {
      // Resize and optimize image for better OCR
      const processedBuffer = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .sharpen()
        .normalize()
        .jpeg({ quality: 90 })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      const processedBuffer = await this.preprocessImage(imageBuffer);
      
      const [result] = await this.client.textDetection({
        image: { content: processedBuffer }
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in image');
      }

      return detections[0].description; // Full text
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseIDData(extractedText) {
    const data = {
      name: null,
      dob: null,
      id_number: null,
      country: null,
      extracted_text: extractedText
    };

    // Extract name (common patterns)
    const namePatterns = [
      /Name[:\s]+([A-Za-z\s]+)/i,
      /Full Name[:\s]+([A-Za-z\s]+)/i,
      /Given Name[:\s]+([A-Za-z\s]+)/i,
      /Surname[:\s]+([A-Za-z\s]+)/i
    ];

    for (const pattern of namePatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }

    // Extract date of birth
    const dobPatterns = [
      /DOB[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Date of Birth[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Birth[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ];

    for (const pattern of dobPatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        const dateStr = match[1];
        const date = this.parseDate(dateStr);
        if (date && this.isValidAge(date)) {
          data.dob = date;
          break;
        }
      }
    }

    // Extract ID number
    const idPatterns = [
      /ID[:\s]+([A-Z0-9]+)/i,
      /Number[:\s]+([A-Z0-9]+)/i,
      /Aadhaar[:\s]+([0-9]{12})/i,
      /PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z]{1})/i,
      /Passport[:\s]+([A-Z0-9]+)/i
    ];

    for (const pattern of idPatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        data.id_number = match[1].trim();
        break;
      }
    }

    // Extract country
    data.country = this.detectCountry(extractedText);

    return data;
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

    if (!ocrData.name || ocrData.name.length < 2) {
      errors.push('Name not found or invalid');
    }

    if (!ocrData.dob) {
      errors.push('Date of birth not found or invalid');
    }

    if (!ocrData.id_number || ocrData.id_number.length < 3) {
      errors.push('ID number not found or invalid');
    }

    if (!ocrData.country) {
      errors.push('Country not detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new OCRService();
