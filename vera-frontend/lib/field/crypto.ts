/**
 * AES-256-GCM encryption for offline storage (§7).
 * Key material is session-scoped; cleared on logout.
 */

const KEY_STORAGE = "vera:field:crypto:salt";
const SESSION_KEY = "vera:field:crypto:session";

function bytesToBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

async function importRawKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function deriveKeyMaterial(secret: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const saltBuf = new Uint8Array(salt);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuf, iterations: 120_000, hash: "SHA-256" },
    baseKey,
    256
  );
}

/** Bind encryption to session + per-device salt (never stored in plain text). */
export async function ensureFieldCryptoKey(sessionSecret: string): Promise<CryptoKey> {
  if (typeof window === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto is not available");
  }

  let saltB64 = localStorage.getItem(KEY_STORAGE);
  if (!saltB64) {
    saltB64 = bytesToBase64(randomBytes(16));
    localStorage.setItem(KEY_STORAGE, saltB64);
  }
  const salt = base64ToBytes(saltB64);

  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached && cached.split(":")[0] === sessionSecret) {
    const raw = base64ToBytes(cached.split(":")[1]!);
    return importRawKey(raw.buffer as ArrayBuffer);
  }

  const bits = await deriveKeyMaterial(sessionSecret, salt);
  const keyBytes = new Uint8Array(bits);
  sessionStorage.setItem(
    SESSION_KEY,
    `${sessionSecret}:${bytesToBase64(keyBytes)}`
  );
  return importRawKey(bits);
}

export function clearFieldCryptoSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<string> {
  const iv = randomBytes(12);
  const plain = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    plain
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return bytesToBase64(combined);
}

export async function decryptJson<T>(key: CryptoKey, payload: string): Promise<T> {
  const combined = base64ToBytes(payload);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

export async function encryptBlob(key: CryptoKey, blob: Blob): Promise<ArrayBuffer> {
  const buf = await blob.arrayBuffer();
  const iv = randomBytes(12);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    buf
  );
  const out = new Uint8Array(iv.length + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), iv.length);
  return out.buffer;
}

export async function decryptBlob(key: CryptoKey, encrypted: ArrayBuffer): Promise<Blob> {
  const combined = new Uint8Array(encrypted);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer
  );
  return new Blob([plain]);
}

/** Compress images before offline storage (§8). */
export async function compressImageForOffline(
  file: Blob,
  maxWidth = 1280,
  quality = 0.72
): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (typeof createImageBitmap === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality);
  });
}
