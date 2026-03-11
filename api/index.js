import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_REST_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_easystudy";

let client;
let db;
let usersCollection;
let decksCollection;
let cardsCollection;
let summariesCollection;
let statsCollection;

async function connectToDatabase() {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db("easystudy_db");
  usersCollection = db.collection("users");
  decksCollection = db.collection("decks");
  cardsCollection = db.collection("cards");
  summariesCollection = db.collection("summaries");
  statsCollection = db.collection("stats");
  return db;
}

// Middleware to ensure DB connection
const dbMiddleware = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  }
};

app.use(dbMiddleware);

// Helper for JSON extraction
function extractJSON(text) {
  try {
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    try {
      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(clean);
    } catch (e2) {
      return null;
    }
  }
}

const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout: la IA tardó más de ${ms / 1000}s`)),
        ms,
      ),
    ),
  ]);
};

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No autorizado" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// --- ENDPOINTS ---

app.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email ya registrado" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      displayName: displayName || email.split("@")[0],
      createdAt: new Date(),
      settings: { theme: "dark", language: "es" },
    };
    const result = await usersCollection.insertOne(newUser);
    const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({
        token,
        user: {
          _id: result.insertedId,
          email: newUser.email,
          displayName: newUser.displayName,
          settings: newUser.settings,
        },
      });
  } catch (error) {
    res.status(500).json({ error: "Error en registro" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Credenciales inválidas" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Error en login" });
  }
});

app.get("/decks", authMiddleware, async (req, res) => {
  try {
    const decks = await decksCollection
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mazos" });
  }
});

app.post("/decks", authMiddleware, async (req, res) => {
  try {
    const { title, description, color, emoji } = req.body;
    if (!title) return res.status(400).json({ error: "Título obligatorio" });
    const newDeck = {
      userId: req.userId,
      title,
      description: description || "",
      color: color || "primary",
      emoji: emoji || "📚",
      createdAt: new Date(),
      updatedAt: new Date(),
      cardCount: 0,
    };
    const result = await decksCollection.insertOne(newDeck);
    res.status(201).json({ ...newDeck, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Error al crear mazo" });
  }
});

app.get("/cards/:deckId", authMiddleware, async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await cardsCollection
      .find({ deckId: new ObjectId(deckId), userId: req.userId })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
});

app.post("/cards", authMiddleware, async (req, res) => {
  try {
    const { deckId, type, front, back, options, correctIndex } = req.body;
    const newCard = {
      userId: req.userId,
      deckId: new ObjectId(deckId),
      type: type || "basic",
      front: front || "",
      back: back || "",
      options: options || [],
      correctIndex: correctIndex !== undefined ? Number(correctIndex) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await cardsCollection.insertOne(newCard);
    await decksCollection.updateOne(
      { _id: new ObjectId(deckId), userId: req.userId },
      { $inc: { cardCount: 1 } },
    );
    res.status(201).json({ ...newCard, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Error al crear tarjeta" });
  }
});

app.post("/ai/generate-cards", authMiddleware, async (req, res) => {
  try {
    const { text, count = 5 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `Analiza el texto y crea ${count} tarjetas. JSON válido. Basic: {front, back, type: "basic"}. Multiple: {front, options, correctIndex, type: "multiple"}. Texto: ${text}`;
    const response = await withTimeout(
      fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
        method: "POST",
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }),
      30000,
    );
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cards = extractJSON(rawText);
    res.json({ cards });
  } catch (error) {
    res.status(500).json({ error: "Error IA" });
  }
});

app.post("/ai/generate-summary", authMiddleware, async (req, res) => {
  try {
    const { text, title } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `Resume elegantemente en Markdown: ${text}`;
    const response = await withTimeout(
      fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
        method: "POST",
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }),
      40000,
    );
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ summary: rawText.trim() });
  } catch (error) {
    res.status(500).json({ error: "Error IA resumen" });
  }
});

app.get("/summaries/:deckId", authMiddleware, async (req, res) => {
  try {
    const summaries = await summariesCollection
      .find({ deckId: new ObjectId(req.params.deckId), userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: "Error resúmenes" });
  }
});

app.post("/summaries", authMiddleware, async (req, res) => {
  try {
    const newSummary = {
      ...req.body,
      deckId: new ObjectId(req.body.deckId),
      userId: req.userId,
      createdAt: new Date(),
    };
    const result = await summariesCollection.insertOne(newSummary);
    res.status(201).json({ ...newSummary, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Error crear resumen" });
  }
});

app.get("/summary/:id", authMiddleware, async (req, res) => {
  try {
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Error detalle resumen" });
  }
});

app.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const stats = await statsCollection.find({ userId: req.userId }).toArray();
    const avgScore =
      stats.length > 0
        ? (stats.reduce((acc, s) => acc + s.score, 0) / stats.length).toFixed(1)
        : 0;
    res.json({
      totalSessions: stats.length,
      avgScore,
      totalTime: stats.reduce((acc, s) => acc + (s.timeSpent || 0), 0),
      recentHistory: stats.slice(-7),
    });
  } catch (error) {
    res.status(500).json({ error: "Error stats" });
  }
});

app.post("/stats", authMiddleware, async (req, res) => {
  try {
    const newStat = {
      ...req.body,
      userId: req.userId,
      date: new Date(),
      deckId: req.body.deckId ? new ObjectId(req.body.deckId) : null,
    };
    await statsCollection.insertOne(newStat);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error guardar stats" });
  }
});

export default app;
