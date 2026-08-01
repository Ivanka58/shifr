import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { pgTable, serial, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

// ─── ПОЛЬЗОВАТЕЛИ ───
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").default("#00ff64"),
  sessionId: text("session_id"),
  isOnline: boolean("is_online").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── СООБЩЕНИЯ (с поддержкой статусов) ───
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  text: text("text").notNull(),
  isEncrypted: boolean("is_encrypted").default(true),
  status: text("status").default("sending"), // sending | sent | delivered | read
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at"),
  editedAt: timestamp("edited_at"),
  deletedForSender: boolean("deleted_for_sender").default(false),
  deletedForRecipient: boolean("deleted_for_recipient").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── PUSH-ПОДПИСКИ ───
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ ───
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  // Уведомления
  notificationsEnabled: boolean("notifications_enabled").default(true),
  notificationSound: boolean("notification_sound").default(true),
  notificationPreview: boolean("notification_preview").default(true),
  // Чаты
  chatBackground: text("chat_background").default("dark"),
  enterToSend: boolean("enter_to_send").default(true),
  // Безопасность
  doubleBottomEnabled: boolean("double_bottom_enabled").default(false),
  doubleBottomPassword: text("double_bottom_password"),
  panicCode: text("panic_code"),
  vanishMode: boolean("vanish_mode").default(false),
  screenshotProtection: boolean("screenshot_protection").default(false),
  maskNotifications: boolean("mask_notifications").default(false),
  maskText: text("mask_text").default("Погода"),
  // Приватность
  hideLastSeen: boolean("hide_last_seen").default(false),
  hideOnline: boolean("hide_online").default(false),
  // Шифрование
  e2eeEnabled: boolean("e2ee_enabled").default(true),
  p2pMode: boolean("p2p_mode").default(false),
  selfDestructTimer: integer("self_destruct_timer").default(0),
});

// ─── ПОДКЛЮЧЕНИЕ ───
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, {
  schema: { users, messages, pushSubscriptions, userSettings },
});

// ─── ИНИЦИАЛИЗАЦИЯ ТАБЛИЦ ───
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#00ff64',
      session_id TEXT,
      is_online BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      from_user_id INT NOT NULL,
      to_user_id INT NOT NULL,
      text TEXT NOT NULL,
      is_encrypted BOOLEAN DEFAULT TRUE,
      status TEXT DEFAULT 'sending',
      read_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      edited_at TIMESTAMPTZ,
      deleted_for_sender BOOLEAN DEFAULT FALSE,
      deleted_for_recipient BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      notification_sound BOOLEAN DEFAULT TRUE,
      notification_preview BOOLEAN DEFAULT TRUE,
      chat_background TEXT DEFAULT 'dark',
      enter_to_send BOOLEAN DEFAULT TRUE,
      double_bottom_enabled BOOLEAN DEFAULT FALSE,
      double_bottom_password TEXT,
      panic_code TEXT,
      vanish_mode BOOLEAN DEFAULT FALSE,
      screenshot_protection BOOLEAN DEFAULT FALSE,
      mask_notifications BOOLEAN DEFAULT FALSE,
      mask_text TEXT DEFAULT 'Погода',
      hide_last_seen BOOLEAN DEFAULT FALSE,
      hide_online BOOLEAN DEFAULT FALSE,
      e2ee_enabled BOOLEAN DEFAULT TRUE,
      p2p_mode BOOLEAN DEFAULT FALSE,
      self_destruct_timer INTEGER DEFAULT 0
    );
  `);
  console.log("✅ Все таблицы созданы (с поддержкой новых фишек)");
}
