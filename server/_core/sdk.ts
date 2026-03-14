import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { Profile } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

// Session management (JWT-based, no OAuth)
async function createSessionToken(profile: Profile): Promise<string> {
  const payload: SessionPayload = {
    openId: profile.id.toString(),
    appId: ENV.appId,
    name: profile.username,
  };

  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secret);

  return token;
}

async function verifySessionToken(token: string): Promise<SessionPayload> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    throw new ForbiddenError("Invalid or expired session");
  }
}

async function getProfileFromRequest(req: Request): Promise<Profile | null> {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const cookieObj = Object.fromEntries(
    cookies.split(";").map(c => c.trim().split("=").map(decodeURIComponent))
  );

  const token = cookieObj[COOKIE_NAME];
  if (!token) return null;

  try {
    const payload = await verifySessionToken(token);
    const profile = await db.getProfileById(parseInt(payload.openId));
    return profile;
  } catch {
    return null;
  }
}

export const sdk = {
  createSessionToken,
  verifySessionToken,
  getProfileFromRequest,
};
