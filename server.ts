import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseVoiceInputLocally } from './src/utils/nlpParser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// Health & Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Voice Parsing endpoint
app.post('/api/parse-voice', async (req: Request, res: Response) => {
  const { transcript, currentDate, currency } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Valid transcript string is required' });
  }

  const effectiveDate = currentDate || new Date().toISOString().split('T')[0];
  const userCurrency = currency || 'INR';

  // If Gemini is not initialized or API key is absent, let client know to use rule-based parser
  if (!aiClient) {
    return res.json({
      fallback: true,
      message: 'GEMINI_API_KEY not configured on server; using high-precision local NLP engine.',
    });
  }

  try {
    const prompt = `You are the AI brain of "VoxTrack AI", a voice-driven expense and task tracker.
Current reference date: ${effectiveDate} (YYYY-MM-DD). Default currency code/symbol: ${userCurrency}.
Analyze the user voice transcript:
"${transcript}"

Classify into either:
- "expense": The user spent money, bought something, paid a bill, or incurred a cost.
- "task": The user wants to do something, be reminded, finish an assignment, call someone, schedule, or buy an item in the future.
- "query": The user is asking about their balance, spending, or tasks (e.g. "what are my expenses?", "how many tasks are left?").
- "unknown": Unrelated audio.

For "expense":
- amount: numeric value (e.g., 250 for "250 rupees", 45.5 for "$45.50").
- currency: extracted or default (e.g. "INR", "USD", "EUR", "GBP").
- category: one of ["Food & Dining", "Groceries", "Transport", "Bills & Utilities", "Shopping", "Entertainment", "Health", "Education", "Travel", "Other"].
- description: clear, clean description (e.g., "Lunch", "Electricity bill", "Coffee at Starbucks").
- date: YYYY-MM-DD (calculate relative to current reference date ${effectiveDate}).
- voiceFeedback: A friendly, concise voice reply under 18 words to be spoken aloud. (e.g., "Logged 250 rupees for lunch under Food and Dining.")

For "task":
- title: concise action title (e.g., "Submit assignment", "Call mom", "Doctor appointment").
- dueDate: YYYY-MM-DD (e.g. if utterance says "tomorrow", calculate ${effectiveDate} + 1 day; if "today", use ${effectiveDate}; if no day mentioned, use ${effectiveDate}).
- priority: "high" | "medium" | "low".
- category: one of ["Work", "Personal", "Study", "Health", "Finance", "Urgent", "General"].
- voiceFeedback: A friendly, concise voice reply under 18 words. (e.g., "Task saved: Submit assignment, due tomorrow.")

For "query" or "unknown":
- voiceFeedback: Helpful short response.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: 'The classified type: expense, task, query, or unknown',
            },
            expense: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                date: { type: Type.STRING },
              },
            },
            task: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                priority: { type: Type.STRING },
                category: { type: Type.STRING },
              },
            },
            voiceFeedback: {
              type: Type.STRING,
              description: 'Natural voice feedback for SpeechSynthesis',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence between 0.0 and 1.0',
            },
          },
          required: ['type', 'voiceFeedback'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        fallback: false,
        source: 'gemini-3.8-flash',
        data: parsed,
      });
    }

    // If empty text, use local parser
    const localFallback = parseVoiceInputLocally(transcript, new Date(effectiveDate), userCurrency);
    return res.json({
      fallback: false,
      source: 'local-nlp',
      data: localFallback,
    });
  } catch (error: any) {
    console.warn('Gemini API call failed (e.g. 503 high demand), using local NLP engine:', error?.message);
    const localFallback = parseVoiceInputLocally(transcript, new Date(effectiveDate), userCurrency);
    return res.json({
      fallback: false,
      source: 'local-nlp',
      data: localFallback,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoxTrack AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
