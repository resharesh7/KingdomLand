import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const initGemini = () => {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return ai;
};

// API Endpoint: automated email outreach builder or lead analysis
app.post('/api/generate-pitch', async (req, res) => {
  try {
    const { apn, address, acreage, zoning, price, ownerName, promptType, notes } = req.body;
    
    // Lazy init
    const aiInstance = initGemini();
    if (!aiInstance) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured. Please fill in your API key in the Secrets panel in AI Studio.' 
      });
    }

    let prompt = '';
    if (promptType === 'outreach') {
      prompt = `You are an elite land wholesaling acquisitions expert at KingdomLand.
Generate an automated, highly-persuasive 3-stage email outreach/marketing sequence for wholesaling the following land parcel to potential land investors/cash buyers:
- Property APN: ${apn}
- Location: ${address}
- Acreage: ${acreage} Acres
- Zoning: ${zoning}
- Wholesale asking price: $${price}
- Contact / Owner Name: ${ownerName}
- Additional Local Field Agent Notes: ${notes || 'None'}

Please build a cohesive and highly detailed email marketing sequence:
- Stage 1: Initial Hook & Core Deal Highlights. Frame this as a rare deep-value opportunity based on acreage and location.
- Stage 2: Value-Add & High-Density Zoning Potential. Explain the development avenues (recreational, commercial, subdividable, residential, agricultural) and buy-box stats.
- Stage 3: Immediate Cash-Back / Urgent Follow-Up. Create professional scarcity (due-diligence active, closing fast, title insurance ready through local title company, escrow security).

You MUST return the output ONLY as a strict JSON ARRAY. Do not include markdown wraps like \`\`\`json outside, just output the raw JSON list of objects matching this exact typescript interface:
[
  { "stage": 1, "subject": "string", "body": "string" },
  { "stage": 2, "subject": "string", "body": "string" },
  { "stage": 3, "subject": "string", "body": "string" }
]`;
    } else {
      prompt = `You are a real estate quantitative data analyst at KingdomLand.
Analyze the investment metrics and wholesale potential of this prospective land lead:
- Property APN: ${apn}
- Location: ${address}
- Acreage: ${acreage} Acres
- Zoning: ${zoning}
- Current Wholesale price: $${price}
- Additional Field Agent Notes: ${notes || 'None'}

Please calculate realistic data metrics and perform a qualitative evaluation.
Return your response STRICTLY as a single valid JSON object. Do not include markdown code blocks. The response layout must fit this format:
{
  "leadScore": 85, // Integer out of 100 based on price/acre, accessibility, and wholesale potential
  "matchingScore": 92, // Integer percentage representing buyer demand matching index
  "projectedROI": "24.5%", // String projected ROI
  "analysisSummary": "Detailed paragraph of the parcel feasibility, road access, utilities, zoning privileges, title risk assessment, and specific monetization path.",
  "suggestedBuyers": [
    "Residential builder looking for a rural retreat tract",
    "Acquisitions fund targeting off-market Mohave land lots",
    "Local agricultural investor or high-yield land bank"
  ]
}`;
    }

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || (promptType === 'outreach' ? '[]' : '{}');
    // Ensure clean output
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseErr) {
      // Fallback clean regex
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in KingdomLand Gemini AI process:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while communicating with the KingdomLand AI Engine.' 
    });
  }
});

// Serve frontend
const PORT = 3000;

const startServer = async () => {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KingdomLand Server] Running at http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to initiate custom Express dev-server:', err);
});
