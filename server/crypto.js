import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// Шифрование сообщения на сервере (второй слой)
export function encryptServer(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptServer(stored) {
  const [ivHex, authTagHex, encrypted] = stored.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Клиентское шифрование (первый слой) — эмуляция для бэкенда
// Реальный E2EE будет на фронтенде через Web Crypto API
export function encryptClient(text, clientKey) {
  // Здесь будет логика для клиентского шифрования
  // Пока оставляем заглушку, но готовим API
  return text;
}

export function decryptClient(encrypted, clientKey) {
  return encrypted;
}

// Генерация ключа для клиента (в будущем)
export function generateClientKey() {
  return crypto.randomBytes(32).toString("hex");
}
