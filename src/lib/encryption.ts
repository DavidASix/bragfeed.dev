// Utility functions for encryption and decryption using Web Crypto API
// This code is designed to work in a Next.js Edge environment
// A environment variable ENCRYPTION_KEY must be set for encryption/decryption to work

/**
 * Converts string to ArrayBuffer for Web Crypto API
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

/**
 * Converts ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts hex string to ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  return new Uint8Array(pairs.map((s) => parseInt(s, 16))).buffer;
}

/**
 * Creates a deterministic IV from the input string and key
 * This ensures the same input with the same key always produces the same IV
 */
async function createDeterministicIV(text: string): Promise<ArrayBuffer> {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Combine the text with the encryption key for IV generation
  const encoder = new TextEncoder();
  const combinedData = encoder.encode(
    text + process.env.ENCRYPTION_KEY + "IV_SALT",
  );

  // Create a hash of the combined data
  const hashBuffer = await crypto.subtle.digest("SHA-256", combinedData);

  // Use the first 16 bytes as the IV
  return hashBuffer.slice(0, 16);
}

/**
 * Derives a key from the ENCRYPTION_KEY environment variable
 * @returns Promise resolving to a CryptoKey
 */
async function deriveKey(): Promise<CryptoKey> {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Convert the secret to an ArrayBuffer
  const encoder = new TextEncoder();
  const keyData = encoder.encode(process.env.ENCRYPTION_KEY);

  // Import the key
  const rawKey = await crypto.subtle.digest("SHA-256", keyData);

  return crypto.subtle.importKey(
    "raw",
    rawKey.slice(0, 32), // Use first 32 bytes for AES-256
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * An edge compatible function which encrypts a string using the ENCRYPTION_KEY environment variable
 * Non-deterministic encryption means the same input will produce different outputs each time
 *
 * @param text The string to encrypt
 * @returns Promise resolving to the encrypted string
 */
export async function encryptNonDeterministic(text: string): Promise<string> {
  // Generate initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Get the key
  const key = await deriveKey();

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv.buffer as ArrayBuffer },
    key,
    stringToArrayBuffer(text),
  );

  // Return IV and encrypted content as hex
  return (
    arrayBufferToHex(iv.buffer as ArrayBuffer) +
    ":" +
    arrayBufferToHex(encryptedData)
  );
}

/**
 * An edge compatible function which encrypts a string using the ENCRYPTION_KEY environment variable
 * Deterministic encryption means the same input will produce the same output each time
 *
 * @param text The string to encrypt
 * @returns Promise resolving to the encrypted string
 */
export async function encryptDeterministic(text: string): Promise<string> {
  // Generate deterministic IV based on input text and key
  const iv = await createDeterministicIV(text);

  // Get the key
  const key = await deriveKey();

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    stringToArrayBuffer(text),
  );

  // Return IV and encrypted content as hex
  return arrayBufferToHex(iv) + ":" + arrayBufferToHex(encryptedData);
}

/**
 * Decrypts a string that was encrypted with the encryptNonDeterministic or encryptDeterministic function
 * @param encryptedText The string to decrypt
 * @returns Promise resolving to the decrypted string
 */
export async function decrypt(encryptedText: string): Promise<string> {
  // Split the IV and encrypted content
  const parts = encryptedText.split(":");
  const [ivHex, encryptedDataHex] = parts;
  if (parts.length !== 2 || !ivHex || !encryptedDataHex) {
    throw new Error("Invalid encrypted text format");
  }

  // Convert hex strings back to ArrayBuffer
  const iv = hexToArrayBuffer(ivHex);
  const encryptedData = hexToArrayBuffer(encryptedDataHex);

  // Get the key
  const key = await deriveKey();

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedData,
  );

  // Convert ArrayBuffer back to string
  return new TextDecoder().decode(decryptedData);
}
