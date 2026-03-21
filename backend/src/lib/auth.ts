import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "altheryx-secret-key-change-me";
const JWT_EXPIRES_IN = "24h";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  userId: string;
  userName: string;
  workspaceId: string;
  workspaceSlug: string;
  role: string;
  isAdmin: boolean;
  isMaster: boolean;
}

export function generateToken(payload: Omit<TokenPayload, "isMaster">): string {
  return jwt.sign({ ...payload, isMaster: false }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateMasterToken(): string {
  const payload: TokenPayload = {
    userId: "master",
    userName: "Master Admin",
    workspaceId: "",
    workspaceSlug: "",
    role: "MASTER_ADMIN",
    isAdmin: true,
    isMaster: true,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
