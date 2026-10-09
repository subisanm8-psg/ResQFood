/**
 * Web Crypto API based password hashing with salt (SHA-256)
 * Note: Demo-level security implementation for client-side demo persistence.
 */

export async function hashPassword(
  password: string,
  providedSalt?: string
): Promise<{ hash: string; salt: string }> {
  const salt = providedSalt || Math.random().toString(36).substring(2, 10);
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':' + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}
