import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").default("#00ff64"),
  sessionId: text("session_id"),
  isOnline: boolean("is_online").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  text: text("text").notNull(),
  isEncrypted: boolean("is_encrypted").default(true),
  readAt: timestamp("read_at"),
  editedAt: timestamp("edited_at"),
  deletedForSender: boolean("deleted_for_sender").default(false),
  deletedForRecipient: boolean("deleted_for_recipient").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema: { users, messages, pushSubscriptions } });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, phone TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#00ff64', session_id TEXT,
      is_online BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY, from_user_id INT NOT NULL, to_user_id INT NOT NULL,
      text TEXT NOT NULL, is_encrypted BOOLEAN DEFAULT TRUE,
      read_at TIMESTAMPTZ, edited_at TIMESTAMPTZ,
      deleted_for_sender BOOLEAN DEFAULT FALSE, deleted_for_recipient BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY, user_id INT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ DB tables ready");
}
