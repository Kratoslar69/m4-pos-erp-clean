import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Profile } from "../../drizzle/schema";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: Profile | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: Profile | null = null;

  try {
    // Obtener token de la cookie o del header Authorization
    let token = opts.req.cookies?.[COOKIE_NAME];
    
    // Si no hay cookie, buscar en el header Authorization
    if (!token) {
      const authHeader = opts.req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (token) {
      // Verificar y decodificar el token JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      user = {
        id: decoded.id,
        username: decoded.username,
        passwordHash: '', // No incluir el hash en el contexto
        storeId: decoded.storeId,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
        commissionRate: decoded.commissionRate || '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
