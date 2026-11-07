require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "25mb" }));
app.use(morgan("combined"));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use("/api/", limiter);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool
  .query("CREATE INDEX IF NOT EXISTS idx_panic_alerts_created_at ON panic_alerts (created_at DESC)")
  .catch(() => {});

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
}

function validatePhoto(photo) {
  if (!photo) return null;
  if (typeof photo !== "string") return "invalid";
  if (!photo.startsWith("data:image/")) return "invalid_type";
  const base64 = photo.split(",")[1] || "";
  const bytes = Buffer.byteLength(base64, "base64");
  const max = Number(process.env.MAX_PHOTO_BYTES) || 5 * 1024 * 1024;
  if (bytes > max) return "too_large";
  return null;
}

const crypto = require("crypto");
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.warn("AVISO: ADMIN_PASSWORD nao definido. Gerando senha aleatoria. Verifique os logs do backend.");
}
const generatedPassword = adminPassword || crypto.randomBytes(12).toString("hex");
if (!adminPassword) {
  console.warn("Senha admin gerada:", generatedPassword);
}
const USERS = [
  {
    username: "admin",
    passwordHash: bcrypt.hashSync(generatedPassword, 10),
  },
];
const REFRESH_TOKENS = new Map();

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  const u = USERS.find((x) => x.username === username);
  if (!u || !(await bcrypt.compare(password || "", u.passwordHash))) {
    return res.status(401).json({ error: "credenciais invalidas" });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "24h" });
  const refreshToken = crypto.randomBytes(40).toString("hex");
  REFRESH_TOKENS.set(refreshToken, username);
  res.json({ token, refreshToken });
});

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  const username = REFRESH_TOKENS.get(refreshToken);
  if (!username) return res.status(401).json({ error: "refresh invalido" });
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

app.post("/api/auth/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  REFRESH_TOKENS.delete(refreshToken);
  res.json({ ok: true });
});

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "token ausente" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "token invalido" });
  }
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/alerts", authMiddleware, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  try {
    const { rows } = await pool.query(
      "SELECT id, name, phone, latitude, longitude, photo, report, tipo, created_at FROM panic_alerts ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset],
    );
    const { rows: c } = await pool.query("SELECT COUNT(*)::int AS total FROM panic_alerts");
    res.json({ data: rows, page, limit, total: c[0].total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/alerts", async (req, res) => {
  const { name, phone, latitude, longitude, photo, report, tipo } = req.body || {};
  if (!name || !phone || latitude == null || longitude == null) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes" });
  }
  const photoErr = validatePhoto(photo);
  if (photoErr) return res.status(400).json({ error: photoErr });
  let photoUrl = null;
  if (photo) {
    // Armazena a foto diretamente no banco (base64), sem depender de MinIO/S3.
    photoUrl = photo;
  }
  const cleanReport = sanitize(report);
  try {
    const { rows } = await pool.query(
      "INSERT INTO panic_alerts (name, phone, latitude, longitude, photo, report, tipo) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        sanitize(name),
        sanitize(phone),
        latitude,
        longitude,
        photoUrl,
        cleanReport,
        sanitize(tipo || "outro"),
      ],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Panic server on http://localhost:${PORT}`));
