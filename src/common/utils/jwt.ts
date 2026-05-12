import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@config/env";
import { UserRole } from "@common/constants/roles";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export interface JwtRefreshPayload extends JwtPayload {
  jti: string;
}

export interface SignedRefreshToken {
  token: string;
  jti: string;
  expiresAtMs: number;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

/** Stateless access decode for logging only — always verify with `verifyAccessToken` on the server. */
export function decodeTokenExpMs(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function createSignedRefreshToken(payload: JwtPayload): SignedRefreshToken {
  const jti = randomUUID();
  const token = jwt.sign({ id: payload.id, role: payload.role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    jwtid: jti,
  } as SignOptions);
  const decoded = jwt.decode(token) as { exp: number; jti: string };
  return { token, jti: decoded.jti, expiresAtMs: decoded.exp * 1000 };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
}
