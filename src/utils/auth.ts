import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function isTokenExpired(expiration: Date): boolean {
  return expiration < new Date();
}

