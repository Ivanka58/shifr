import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import webpush from "web-push";
import pino from "pino";
import pinoHttp from "pino-http";
import { db, initDb, users, messages, pushSubscriptions, userSettings } from "./db.js";
import { encryptServer, decryptServer } from "./crypto.js";
import { eq, and, or, isNull, sql } from "drizzle-orm";

const app = express();
const logger = pino({ level: "info" });

// ─── MIDDLEWARE ───
app.use(pinoHttp({ logger }));
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// ─── VAPID ───
webpush.setVapidDetails(
  "mailto:admin@shifr.app",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── RATE LIMIT ───
const rateMap = new Map();
function rateLimit(userId) {
  const now = Date.now();
  const entry = rateMap.get(userId) || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  rateMap.set(userId, entry);
  return entry.count > 60;
}

// ─── AUTH MIDDLEWARE ───
async function requireSession(req, res, next) {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(401).json({ error: "No session" });

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.sessionId, sessionId))
    .limit(1);

  if (!result.length) return res.status(401).json({ error: "Invalid session" });
  req.userId = result[0].id;
  next();
}

// ─── САНИТИЗАЦИЯ ───
function sanitize(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── HEALTH ───
app.get("/api/healthz", (req, res) => res.json({ status: "ok" }));

// ─── AUTH ───
app.post("/api/auth/login", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  let userId;
  if (!existing.length) {
    const name = "User_" + phone.slice(-4);
    const result = await db.insert(users).values({ phone, name }).returning();
    userId = result[0].id;
  } else {
    userId = existing[0].id;
  }

  // Создаем настройки по умолчанию, если их нет
  const settingsExist = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!settingsExist.length) {
    await db.insert(userSettings).values({ userId });
  }

  res.json({ message: "Code sent", code: "A-123456" });
});

app.post("/api/auth/verify", async (req, res) => {
  const { phone, code } = req.body;
  if (code !== "A-123456") return res.status(400).json({ error: "Wrong code" });

  const sessionId = crypto.randomUUID();
  const result = await db
    .update(users)
    .set({ sessionId, isOnline: true })
    .where(eq(users.phone, phone))
    .returning();

  if (!result.length) return res.status(404).json({ error: "User not found" });

  const user = result[0];
  res.json({
    sessionId,
    userId: user.id,
    name: user.name,
    phone: user.phone,
    avatarColor: user.avatarColor,
  });
});

// ─── USERS ───
app.get("/api/users/me", requireSession, async (req, res) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, req.userId))
    .limit(1);
  res.json(result[0]);
});

app.patch("/api/users/me", requireSession, async (req, res) => {
  const { name, avatarColor } = req.body;
  const result = await db
    .update(users)
    .set({ name, avatarColor })
    .where(eq(users.id, req.userId))
    .returning();
  res.json(result[0]);
});

app.get("/api/users", requireSession, async (req, res) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      avatarColor: users.avatarColor,
      isOnline: users.isOnline,
    })
    .from(users);
  res.json(result);
});

app.get("/api/users/:id", requireSession, async (req, res) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(req.params.id)))
    .limit(1);
  if (!result.length) return res.status(404).json({ error: "Not found" });
  res.json(result[0]);
});

// ─── НАСТРОЙКИ ───
app.get("/api/settings", requireSession, async (req, res) => {
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, req.userId))
    .limit(1);
  res.json(result[0] || {});
});

app.patch("/api/settings", requireSession, async (req, res) => {
  const { ...updates } = req.body;
  const result = await db
    .update(userSettings)
    .set(updates)
    .where(eq(userSettings.userId, req.userId))
    .returning();
  res.json(result[0]);
});

// ─── MESSAGES ───
app.get("/api/messages/stats", requireSession, async (req, res) => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(messages)
    .where(
      or(
        eq(messages.fromUserId, req.userId),
        eq(messages.toUserId, req.userId)
      )
    );
  res.json({ total: result[0].count });
});

app.get("/api/messages/unread", requireSession, async (req, res) => {
  const result = await db
    .select({ count: sql`count(*)`, fromUserId: messages.fromUserId })
    .from(messages)
    .where(
      and(
        eq(messages.toUserId, req.userId),
        isNull(messages.readAt),
        eq(messages.deletedForRecipient, false)
      )
    )
    .groupBy(messages.fromUserId);
  res.json(result);
});

app.get("/api/messages/:userId", requireSession, async (req, res) => {
  const otherId = parseInt(req.params.userId);
  const me = req.userId;

  // Помечаем как доставленные и прочитанные
  await db
    .update(messages)
    .set({ 
      deliveredAt: new Date(),
      status: "delivered"
    })
    .where(
      and(
        eq(messages.fromUserId, otherId),
        eq(messages.toUserId, me),
        eq(messages.status, "sending")
      )
    );

  await db
    .update(messages)
    .set({ 
      readAt: new Date(),
      status: "read"
    })
    .where(
      and(
        eq(messages.fromUserId, otherId),
        eq(messages.toUserId, me),
        isNull(messages.readAt)
      )
    );

  const result = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.fromUserId, me), eq(messages.toUserId, otherId)),
        and(eq(messages.fromUserId, otherId), eq(messages.toUserId, me))
      )
    )
    .orderBy(messages.createdAt)
    .limit(100);

  const filtered = result
    .filter((m) => {
      if (m.fromUserId === me && m.deletedForSender) return false;
      if (m.toUserId === me && m.deletedForRecipient) return false;
      return true;
    })
    .map((m) => ({
      ...m,
      text: m.isEncrypted ? decryptServer(m.text) : m.text,
    }));

  res.json(filtered);
});

app.post("/api/messages", requireSession, async (req, res) => {
  const { toUserId, text } = req.body;
  const me = req.userId;

  if (rateLimit(me)) return res.status(429).json({ error: "Rate limit" });
  if (!text || !toUserId) return res.status(400).json({ error: "Missing fields" });

  const clean = sanitize(text);
  const encryptedText = encryptServer(clean);

  const result = await db
    .insert(messages)
    .values({
      fromUserId: me,
      toUserId,
      text: encryptedText,
      isEncrypted: true,
      status: "sending",
    })
    .returning();

  const msg = result[0];

  // Отмечаем как отправленное
  await db
    .update(messages)
    .set({ status: "sent", deliveredAt: new Date() })
    .where(eq(messages.id, msg.id));

  // Push уведомления
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, toUserId));

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ 
          title: "SHIFR", 
          body: "Новое сообщение", 
          tag: `msg-${me}`,
          data: { messageId: msg.id }
        })
      );
    } catch (e) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, sub.endpoint));
      }
    }
  }

  res.json({ ...msg, text: clean });
});

app.delete("/api/messages/:id", requireSession, async (req, res) => {
  const id = parseInt(req.params.id);
  const scope = req.query.scope || "self";
  const me = req.userId;

  const msg = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);

  if (!msg.length) return res.status(404).json({ error: "Not found" });
  const m = msg[0];

  if (scope === "all" && m.fromUserId === me) {
    await db.delete(messages).where(eq(messages.id, id));
  } else {
    if (m.fromUserId === me) {
      await db.update(messages).set({ deletedForSender: true }).where(eq(messages.id, id));
    } else if (m.toUserId === me) {
      await db.update(messages).set({ deletedForRecipient: true }).where(eq(messages.id, id));
    }
  }

  res.json({ success: true });
});

app.patch("/api/messages/:id", requireSession, async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;
  const me = req.userId;

  const msg = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, id), eq(messages.fromUserId, me)))
    .limit(1);

  if (!msg.length) return res.status(404).json({ error: "Not found" });

  const clean = sanitize(text);
  const encryptedText = encryptServer(clean);

  const result = await db
    .update(messages)
    .set({ text: encryptedText, editedAt: new Date() })
    .where(eq(messages.id, id))
    .returning();

  res.json({ ...result[0], text: clean });
});

// ─── PUSH ───
app.get("/api/push/vapid-public-key", (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

app.post("/api/push/subscribe", requireSession, async (req, res) => {
  const { endpoint, keys } = req.body;
  await db
    .insert(pushSubscriptions)
    .values({
      userId: req.userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })
    .onConflictDoNothing();
  res.json({ success: true });
});

app.delete("/api/push/subscribe", requireSession, async (req, res) => {
  const { endpoint } = req.body;
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  res.json({ success: true });
});

// ─── СТАРТ ───
const PORT = process.env.PORT || 3000;

initDb().then(() => {
  app.listen(PORT, () => logger.info(`🚀 SHIFR Server v2.0 running on port ${PORT}`));
});
