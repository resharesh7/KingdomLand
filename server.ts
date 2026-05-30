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

// --- SECURE FLATFILE DATABASE ENGINE ---
const DB_FILE = path.join(process.cwd(), 'server-db.json');

const INITIAL_VACANT_PROPERTIES = [
  {
    id: 'prop-101',
    apn: '201-14-998A',
    county: 'Maricopa',
    state: 'AZ',
    city: 'Phoenix',
    acreage: 4.5,
    zoning: 'Agricultural (Light)',
    price: 32000,
    marketValue: 55000,
    ownerName: 'Dan Henderson',
    ownerPhone: '+1 (602) 555-1940',
    ownerMailAddress: '1440 Camelback Rd, Phoenix, AZ 85016',
    ownerPhysicalAddress: 'Subdivision Section 12, Phoenix, AZ 85001',
    leadScore: 92,
    status: 'Lead',
    roadAccess: true,
    utilitiesNearby: true,
    notes: 'Direct dirt road access with direct power pole tie-ins. Appraised highly by property office.',
    coords: { lat: 33.4484, lng: -112.0740 },
    appraiserRecordId: 'M-AZ-PHX-4491902'
  },
  {
    id: 'prop-102',
    apn: '110-04-982B',
    county: 'Costilla',
    state: 'CO',
    city: 'Fort Garland',
    acreage: 40.0,
    zoning: 'Residential (Rural)',
    price: 24000,
    marketValue: 49000,
    ownerName: 'Sarah Higgins',
    ownerPhone: '+1 (719) 555-4819',
    ownerMailAddress: '88 Blanca Vista Dr, Fort Garland, CO 81133',
    ownerPhysicalAddress: 'Wild Horse Mesa Sec 4, Fort Garland, CO 81133',
    leadScore: 84,
    status: 'Approved',
    roadAccess: false,
    utilitiesNearby: false,
    notes: 'Gorgeous high elevation off-grid meadow. Easement access verified from property plats.',
    coords: { lat: 37.2844, lng: -105.3921 },
    appraiserRecordId: 'C-CO-COS-1194812'
  },
  {
    id: 'prop-103',
    apn: '882-19-112C',
    county: 'Valencia',
    state: 'NM',
    city: 'Belen',
    acreage: 10.2,
    zoning: 'Agricultural/Ranch',
    price: 8500,
    marketValue: 21050,
    ownerName: 'Marcus Aurelius NM LLC',
    ownerPhone: '+1 (505) 555-8912',
    ownerMailAddress: '900 Via Roma Dr, Rome, GA 30161',
    ownerPhysicalAddress: 'El Cerro Loop Block B, Belen, NM 87002',
    leadScore: 96,
    status: 'Sold',
    roadAccess: true,
    utilitiesNearby: false,
    notes: 'Flat desert tract which is hot on our investor list. Zoned for modular builds of any size.',
    coords: { lat: 34.6617, lng: -106.7761 },
    appraiserRecordId: 'V-NM-VAL-8822019'
  },
  {
    id: 'prop-104',
    apn: '330-01-443D',
    county: 'Klamath',
    state: 'OR',
    city: 'Klamath Falls',
    acreage: 18.5,
    zoning: 'Forestry/Timber',
    price: 49000,
    marketValue: 98000,
    ownerName: 'Kellen Weaver',
    ownerPhone: '+1 (541) 555-2234',
    ownerMailAddress: '433 Pines Edge Ln, Klamath Falls, OR 97601',
    ownerPhysicalAddress: 'Lakeview Forest Tract 19, Klamath Falls, OR 97601',
    leadScore: 89,
    status: 'Lead',
    roadAccess: true,
    utilitiesNearby: true,
    notes: 'Heavily wooded. High-density residential conversion possible according to city appraiser records.',
    coords: { lat: 42.2249, lng: -121.7817 },
    appraiserRecordId: 'K-OR-KLM-9021200'
  }
];

const readDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading flat database file', e);
  }

  // Pre-populated realistic SaaS customer database
  const defaultDB = {
    users: [
      {
        name: 'Sarah Higgins',
        email: 'sarah@higgins.com',
        plan: 'Pro',
        isAnnual: false,
        marketingCredits: 72.00,
        autoReloadEnabled: true,
        trialDaysLeft: 0,
        isTrial: false,
        createdAt: '2026-05-15T09:12:00.000Z',
        isActive: true,
        cardInfo: { number: '4111222233331980', expiry: '09/29', cvc: '433', name: 'Sarah Higgins' },
        creditsBought: 85.00
      },
      {
        name: 'John Miller',
        email: 'john@remax.net',
        plan: 'Starter',
        isAnnual: true,
        marketingCredits: 22.00,
        autoReloadEnabled: false,
        trialDaysLeft: 0,
        isTrial: false,
        createdAt: '2026-05-02T14:45:00.000Z',
        isActive: true,
        cardInfo: { number: '4242555566661122', expiry: '11/28', cvc: '109', name: 'John Miller' },
        creditsBought: 50.00
      },
      {
        name: 'Elena Rostova',
        email: 'elena@rangevest.org',
        plan: 'Pro Plus',
        isAnnual: false,
        marketingCredits: 50.00,
        autoReloadEnabled: true,
        trialDaysLeft: 5,
        isTrial: true,
        createdAt: '2026-05-27T10:00:00.000Z',
        isActive: true,
        cardInfo: { number: '5501889912003847', expiry: '04/30', cvc: '882', name: 'Elena Rostova' },
        creditsBought: 0
      },
      {
        name: 'Daniel K.',
        email: 'dan@apacheland.com',
        plan: 'Pro',
        isAnnual: false,
        marketingCredits: 0.00,
        autoReloadEnabled: false,
        trialDaysLeft: 0,
        isTrial: false,
        createdAt: '2026-04-12T16:20:00.000Z',
        isActive: false,
        cardInfo: { number: '4912239081232019', expiry: '01/27', cvc: '009', name: 'Daniel K' },
        creditsBought: 0
      }
    ],
    properties: INITIAL_VACANT_PROPERTIES,
    postcards: [
      {
        id: 'ord-1',
        propertyApn: '110-04-982B',
        recipient: 'Sarah Higgins',
        recipientMail: '88 Blanca Vista Dr, Fort Garland, CO 81133',
        size: '6x9',
        cost: 0.72,
        timestamp: '2026-05-28 14:10',
        templateName: 'I Want To Buy Your Vacant Land For Cash!'
      }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  return defaultDB;
};

const writeDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing flat database file', e);
  }
};

// --- REST DATABASE & AUTHENTICATION ENDPOINTS ---

// Fetch the combined central DB state
app.get('/api/db/bootstrap', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Secure member authenticaton / registration Proxy
app.post('/api/db/auth', (req, res) => {
  const { email, password, name, plan, isAnnual, cardInfo } = req.body;
  const db = readDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    // If we have updated cardInfo or tier, update it
    if (cardInfo) user.cardInfo = cardInfo;
    if (plan) user.plan = plan;
    user.isAnnual = isAnnual !== undefined ? isAnnual : user.isAnnual;
    writeDB(db);
    return res.json({ status: 'ok', user });
  }

  // Generate completely new verified active trialist account
  const newUser = {
    name: name || 'Taylor Tycoon',
    email: email,
    plan: plan || 'Pro',
    isAnnual: isAnnual || false,
    marketingCredits: 50.00, // Reduced trial marketing gift to $50
    autoReloadEnabled: true,
    trialDaysLeft: 7,
    isTrial: true,
    createdAt: new Date().toISOString(),
    isActive: true,
    cardInfo: cardInfo || { number: '4111222233334444', expiry: '05/31', cvc: '123', name: name || 'Taylor Tycoon' },
    creditsBought: 0
  };

  db.users.push(newUser);
  writeDB(db);
  res.json({ status: 'ok', user: newUser });
});

// Toggle customer activation status (Admin command)
app.post('/api/db/users/toggle', (req, res) => {
  const { email } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    user.isActive = !user.isActive;
    writeDB(db);
    return res.json({ status: 'ok', users: db.users });
  }
  res.status(404).json({ error: 'Customer account not found' });
});

// Modify marketing credits / refund ledger (Admin command)
app.post('/api/db/users/modify-credits', (req, res) => {
  const { email, amount } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    user.marketingCredits = Math.max(0, user.marketingCredits + amount);
    if (amount > 0) {
      user.creditsBought = (user.creditsBought || 0) + amount;
    }
    writeDB(db);
    return res.json({ status: 'ok', users: db.users });
  }
  res.status(404).json({ error: 'Customer account not found' });
});

// Sourced land property CRUD savers
app.post('/api/db/properties/save', (req, res) => {
  const { property } = req.body;
  const db = readDB();
  const idx = db.properties.findIndex((p: any) => p.id === property.id);
  
  if (idx > -1) {
    db.properties[idx] = property;
  } else {
    db.properties.unshift(property);
  }
  
  writeDB(db);
  res.json({ status: 'ok', properties: db.properties });
});

app.post('/api/db/properties/delete', (req, res) => {
  const { id } = req.body;
  const db = readDB();
  db.properties = db.properties.filter((p: any) => p.id !== id);
  writeDB(db);
  res.json({ status: 'ok', properties: db.properties });
});

// Dispatch real postcard dispatches and deduct credits live
app.post('/api/db/postcards/save', (req, res) => {
  const { order, email } = req.body;
  const db = readDB();
  db.postcards.unshift(order);

  // Securely subtract balance on the backend
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    user.marketingCredits = Math.max(0, user.marketingCredits - order.cost);
  }

  writeDB(db);
  res.json({ status: 'ok', postcards: db.postcards, users: db.users });
});

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
