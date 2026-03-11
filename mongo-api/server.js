const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// URL base de la REST API de Gemini (v1beta)
const GEMINI_REST_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// El MONGODB_URI se carga desde el archivo .env
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Falta la variable MONGODB_URI en el archivo .env");
  process.exit(1);
}

const client = new MongoClient(uri);
let collection;
let usersCollection;
let decksCollection;
let cardsCollection;
let summariesCollection;

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_easystudy";

async function start() {
  try {
    await client.connect();
    // Base de datos de EasyStudy
    const db = client.db("easystudy_db");
    // Usaremos una colección de prueba llamada "items", se usarán más en el futuro
    collection = db.collection("items");
    usersCollection = db.collection("users");
    decksCollection = db.collection("decks");
    cardsCollection = db.collection("cards");
    summariesCollection = db.collection("summaries");
    statsCollection = db.collection("stats");

    console.log("✅ Conectado exitosamente a MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
}

start();

// --- ENDPOINTS DE AUTENTICACIÓN ---

app.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

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

    res.status(201).json({
      token,
      user: {
        _id: result.insertedId,
        email: newUser.email,
        displayName: newUser.displayName,
        settings: newUser.settings,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Convertir _id a string para consistencia
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// --- ENDPOINTS DE ITEMS (Protegidos) ---
app.get("/items", authMiddleware, async (req, res) => {
  try {
    const items = await collection.find({ userId: req.userId }).toArray();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener items" });
  }
});

app.post("/items", authMiddleware, async (req, res) => {
  try {
    const newItem = { ...req.body, userId: req.userId, createdAt: new Date() };
    const result = await collection.insertOne(newItem);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el item" });
  }
});

// --- ENDPOINTS DE MAZOS (DECKS) ---

app.get("/decks", authMiddleware, async (req, res) => {
  try {
    // Ordenar por más recientes primero
    const decks = await decksCollection
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(decks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener mazos" });
  }
});

app.post("/decks", authMiddleware, async (req, res) => {
  try {
    const { title, description, color, emoji } = req.body;
    if (!title)
      return res.status(400).json({ error: "El título es obligatorio" });

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
    console.error(error);
    res.status(500).json({ error: "Error al crear el mazo" });
  }
});

app.put("/decks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, color, emoji } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (color !== undefined) updateFields.color = color;
    if (emoji !== undefined) updateFields.emoji = emoji;

    const result = await decksCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.userId },
      { $set: updateFields },
      { returnDocument: "after" }, // Devuelve el documento actualizado
    );

    if (!result) {
      return res
        .status(404)
        .json({ error: "Mazo no encontrado o no autorizado" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el mazo" });
  }
});

app.delete("/decks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar si es un ObjectId válido
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const result = await decksCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Mazo no encontrado o no autorizado" });
    }

    // Al eliminar el mazo, también eliminamos todas las tarjetas contenidas en él
    await cardsCollection.deleteMany({
      deckId: new ObjectId(id),
      userId: req.userId,
    });

    res.json({
      success: true,
      message: "Mazo y sus tarjetas eliminadas exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el mazo" });
  }
});

// --- ENDPOINTS DE TARJETAS (CARDS) ---

app.get("/cards/:deckId", authMiddleware, async (req, res) => {
  try {
    const { deckId } = req.params;
    if (!ObjectId.isValid(deckId))
      return res.status(400).json({ error: "ID de mazo inválido" });

    const cards = await cardsCollection
      .find({
        deckId: new ObjectId(deckId),
        userId: req.userId,
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
});

app.post("/cards", authMiddleware, async (req, res) => {
  try {
    const { deckId, type, front, back, options, answer } = req.body;

    if (!deckId || !ObjectId.isValid(deckId))
      return res
        .status(400)
        .json({ error: "Id del Mazo inválido o requerido" });

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

    // Incrementar cardCount en el mazo
    await decksCollection.updateOne(
      { _id: new ObjectId(deckId), userId: req.userId },
      { $inc: { cardCount: 1 } },
    );

    res.status(201).json({ ...newCard, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la tarjeta" });
  }
});

app.put("/cards/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { front, back, type, options, answer } = req.body;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const updateFields = { updatedAt: new Date() };
    if (front !== undefined) updateFields.front = front;
    if (back !== undefined) updateFields.back = back;
    if (type !== undefined) updateFields.type = type;
    if (options !== undefined) updateFields.options = options;
    if (correctIndex !== undefined)
      updateFields.correctIndex = Number(correctIndex);

    const result = await cardsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.userId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result)
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la tarjeta" });
  }
});

app.delete("/cards/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const card = await cardsCollection.findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });
    if (!card) return res.status(404).json({ error: "Tarjeta no encontrada" });

    await cardsCollection.deleteOne({ _id: new ObjectId(id) });

    // Decrementar cardCount en el mazo
    await decksCollection.updateOne(
      { _id: card.deckId, userId: req.userId },
      { $inc: { cardCount: -1 } },
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la tarjeta" });
  }
});

// --- ENDPOINT GEMINI AI (REST API directa, compatible con Node.js v24) ---

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

// Función auxiliar para extraer JSON de una cadena que puede tener texto basura o markdown
function extractJSON(text) {
  try {
    // Intentar encontrar un bloque JSON (arreglo o objeto)
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return null;
    
    // Limpiar posibles residuos de markdown si el match fue muy amplio
    let jsonStr = match[0];
    
    // Intentar parsear
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("❌ Error al extraer JSON:", e.message);
    // Intento desesperado: limpiar markdown manual
    try {
        const desperateClean = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(desperateClean);
    } catch (e2) {
        return null;
    }
  }
}

app.post("/ai/generate-cards", authMiddleware, async (req, res) => {
  try {
    const { text, count = 5 } = req.body;

    if (!text || text.trim().length < 20) {
      return res
        .status(400)
        .json({ error: "Texto muy corto (mínimo 20 caracteres)" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("TU_CLAVE") || apiKey.length < 10) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY no configurada correctamente" });
    }

    console.log(`🤖 Generando ${count} tarjetas via REST API...`);

    const prompt = `Eres un experto creador de tarjetas de estudio. Analiza el siguiente texto y crea exactamente ${count} tarjetas de estudio.
Mezcla tipos de tarjetas: algunas "basic" (pregunta/respuesta) y otras "multiple" (opción múltiple con 4 opciones).

IMPORTANTE: Responde SOLO con un arreglo JSON válido, sin markdown, siguiendo este esquema:
Para "basic": {"front":"Pregunta","back":"Respuesta","type":"basic"}
Para "multiple": {"front":"Pregunta","options":["Opción A","Opción B","Opción C","Opción D"],"correctIndex": 0, "type":"multiple"}

Texto: """${text}"""`;

    const fetchCall = fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    });

    const response = await withTimeout(fetchCall, 30000);
    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.error("❌ Gemini API error:", errMsg);
      return res
        .status(500)
        .json({ error: `Error de la API de Gemini: ${errMsg}` });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error(
        "❌ No se pudo extraer texto de la respuesta:",
        JSON.stringify(data),
      );
      return res.status(500).json({ error: "La IA no devolvió texto válido" });
    }

    console.log("✅ Respuesta recibida, parseando JSON...");
    const cards = extractJSON(rawText);
    
    if (!cards || !Array.isArray(cards)) {
      console.error("❌ El JSON extraído no es un arreglo válido:", rawText);
      return res.status(500).json({ error: "La IA generó un formato JSON inválido" });
    }

    console.log(`✅ ${cards.length} tarjetas generadas exitosamente`);
    res.json({ cards });
  } catch (error) {
    console.error("\n❌ Error en /ai/generate-cards:", error.message);
    const userMsg = error.message.includes("Timeout")
      ? "La IA tardó demasiado. Intenta con un texto más corto."
      : "Error al generar tarjetas con inteligencia artificial";
    res.status(500).json({ error: userMsg, detail: error.message });
  }
});

app.get("/summary/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID de resumen inválido" });

    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (!summary)
      return res.status(404).json({ error: "Resumen no encontrado" });

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el resumen" });
  }
});

// --- ENDPOINTS DE RESÚMENES ---

app.get("/summaries/:deckId", authMiddleware, async (req, res) => {
  try {
    const { deckId } = req.params;
    if (!ObjectId.isValid(deckId))
      return res.status(400).json({ error: "ID de mazo inválido" });

    const summaries = await summariesCollection
      .find({ deckId: new ObjectId(deckId), userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(summaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resúmenes" });
  }
});

app.post("/summaries", authMiddleware, async (req, res) => {
  try {
    const { deckId, title, content } = req.body;

    if (!deckId || !ObjectId.isValid(deckId))
      return res.status(400).json({ error: "deckId requerido e inválido" });

    const newSummary = {
      userId: req.userId,
      deckId: new ObjectId(deckId),
      title: title || "Sin título",
      content: content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await summariesCollection.insertOne(newSummary);
    res.status(201).json({ ...newSummary, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear resumen" });
  }
});

app.put("/summaries/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID de resumen inválido" });

    const updateFields = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;

    const result = await summariesCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.userId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result)
      return res.status(404).json({ error: "Resumen no encontrado" });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar resumen" });
  }
});

app.delete("/summaries/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID de resumen inválido" });

    const result = await summariesCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Resumen no encontrado" });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar resumen" });
  }
});

// IA para generar resúmenes
app.post("/ai/generate-summary", authMiddleware, async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text || text.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Texto insuficiente para generar un resumen sólido" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`🤖 Generando resumen para: ${title || "Apuntes"}...`);

    const prompt = `Eres un experto en síntesis educativa de nivel premium. Tu objetivo es transformar el texto proporcionado en un resumen de ALTO VALOR VISUAL y conceptual.

REGLAS CRÍTICAS DE SALIDA:
1. NO incluyas introducciones ni despedidas (ej: "Aquí tienes el resumen...", "Espero que te sirva"). La salida debe EMPEZAR directamente con el primer encabezado.
2. Usa Markdown puro pero minimalista.
3. Estructura con H1 (#) para el título principal, H2 (##) para secciones principales. NO uses más de 3 niveles de profundidad.
4. NUNCA uses símbolos de separación raros como *** o ---. Usa espacios en blanco (saltos de línea) para separar secciones.
5. Usa negritas (**) SOLO para los términos clave fundamentales de cada párrafo. No satures.
6. Asegúrate de que los encabezados tengan un espacio después del símbolo # (ej: "# Título").
7. La salida debe ser elegante, limpia y enfocada 100% en el aprendizaje.

Texto a sintetizar: """${text}"""`;

    const fetchCall = fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
      }),
    });

    const response = await withTimeout(fetchCall, 40000);
    const data = await response.json();

    if (!response.ok)
      throw new Error(data?.error?.message || "Error en API de Gemini");

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("La IA no devolvió texto");

    res.json({
      summary: rawText
        .replace(/^```markdown\n?/i, "")
        .replace(/^```\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim(),
    });
  } catch (error) {
    console.error("\n❌ Error en /ai/generate-summary:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ENDPOINTS DE ESTADÍSTICAS ---

app.get("/stats", authMiddleware, async (req, res) => {
  try {
    const stats = await statsCollection
      .find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .toArray();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

app.post("/stats", authMiddleware, async (req, res) => {
  try {
    const { deckId, score, totalCards, timeSpent } = req.body;

    const newStat = {
      userId: req.userId,
      deckId: deckId ? new ObjectId(deckId) : null,
      score,
      totalCards,
      timeSpent,
      date: new Date(),
    };

    await statsCollection.insertOne(newStat);
    res.status(201).json({ message: "Estadística guardada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar estadística" });
  }
});

app.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await statsCollection.find({ userId }).toArray();

    // Cálculo básico de resumen
    const totalSessions = stats.length;
    const avgScore =
      stats.length > 0
        ? (stats.reduce((acc, s) => acc + s.score, 0) / stats.length).toFixed(1)
        : 0;
    const totalTime = stats.reduce((acc, s) => acc + (s.timeSpent || 0), 0);

    // Calcular racha (simple: días consecutivos con sesiones)
    // Para simplificar, devolvemos datos agregados
    res.json({
      totalSessions,
      avgScore,
      totalTime,
      recentHistory: stats.slice(-7),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen de estadísticas" });
  }
});
