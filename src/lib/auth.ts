import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a PIN using bcrypt
 * @param pin - The plain text PIN to hash
 * @returns Promise<string> - The hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  
  return await bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against its hash
 * @param pin - The plain text PIN to verify
 * @param hashedPin - The hashed PIN to compare against
 * @returns Promise<boolean> - True if PIN matches, false otherwise
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return false;
  }
  
  return await bcrypt.compare(pin, hashedPin);
}

/**
 * Validate PIN format
 * @param pin - The PIN to validate
 * @returns boolean - True if PIN is valid format, false otherwise
 */
export function isValidPin(pin: string): boolean {
  return typeof pin === 'string' && pin.length === 4 && /^\d{4}$/.test(pin);
}