import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    admin?: { username: string };
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const token = header.slice(7);
        const payload = jwt.verify(token, JWT_SECRET) as { username: string };
        req.admin = { username: payload.username };
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

export function signToken(username: string): string {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
}
