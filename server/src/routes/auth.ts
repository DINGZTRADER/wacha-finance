import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth.js";

const router = Router();

const ADMIN_USER = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "wachaai2026";

// Pre-hash the password on first load
let hashedPassword: string | null = null;
async function getHash() {
    if (!hashedPassword) hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
    return hashedPassword;
}

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username !== ADMIN_USER) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const hash = await getHash();
        const valid = await bcrypt.compare(password, hash);
        if (!valid && password !== ADMIN_PASS) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = signToken(username);
        res.json({ token, username });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

export default router;
