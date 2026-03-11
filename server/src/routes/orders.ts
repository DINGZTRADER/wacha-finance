import { Router } from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { isFlutterwaveConfigured, initiateMoMoCharge, getManualPaymentInfo } from "../utils/flutterwave.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

/* ── Create order (initiate purchase) ────────────────────────────── */
router.post("/", async (req, res) => {
    try {
        const { song_id, customer_name, customer_phone, customer_email, payment_method } = req.body;

        // Validate song exists
        const song = db
            .prepare("SELECT * FROM songs WHERE id = ? AND is_active = 1")
            .get(song_id) as any;
        if (!song) {
            res.status(404).json({ error: "Song not found" });
            return;
        }

        const id = uuid();
        const downloadToken = uuid();

        db.prepare(
            `INSERT INTO orders (id, song_id, customer_name, customer_phone, customer_email, amount, payment_method, download_token)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(id, song_id, customer_name, customer_phone, customer_email ?? null, song.price, payment_method ?? "mtn_momo", downloadToken);

        // Try automated payment via Flutterwave
        if (isFlutterwaveConfigured() && payment_method) {
            const network = payment_method === "airtel" ? "AIRTEL" : "MTN";
            const charge = await initiateMoMoCharge({
                txRef: id,
                amount: song.price,
                currency: "UGX",
                phone: customer_phone,
                network,
                email: customer_email ?? `${customer_phone}@wachaai.com`,
                name: customer_name,
                description: `Purchase: ${song.title}`,
                callbackUrl: `${FRONTEND_URL}/download/${downloadToken}`,
            });

            if (charge.data?.flw_ref) {
                db.prepare("UPDATE orders SET flw_ref = ? WHERE id = ?").run(charge.data.flw_ref, id);
            }

            res.status(201).json({
                order_id: id,
                payment_mode: "automated",
                flutterwave: charge,
                message: "A payment prompt has been sent to your phone. Approve to complete the purchase.",
            });
            return;
        }

        // Manual payment mode
        const paymentInfo = getManualPaymentInfo();
        res.status(201).json({
            order_id: id,
            payment_mode: "manual",
            amount: song.price,
            payment_info: {
                ...paymentInfo,
                reference: id.slice(0, 8).toUpperCase(),
                instructions: `Send UGX ${song.price.toLocaleString()} to ${paymentInfo.network} ${paymentInfo.phone} (${paymentInfo.name}). Use reference: ${id.slice(0, 8).toUpperCase()}`,
            },
            message: "Send payment via Mobile Money, then we'll verify and send your download link.",
        });
    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

/* ── Admin: list all orders ──────────────────────────────────────── */
router.get("/", requireAuth as any, (_req, res) => {
    const orders = db
        .prepare(
            `SELECT o.*, s.title as song_title, s.artist as song_artist
             FROM orders o JOIN songs s ON o.song_id = s.id
             ORDER BY o.created_at DESC`
        )
        .all();
    res.json(orders);
});

/* ── Admin: approve order (manual verification) ──────────────────── */
router.patch("/:id/approve", requireAuth as any, (req, res) => {
    const { payment_ref } = req.body;
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
    if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
    }

    db.prepare(
        `UPDATE orders SET status = 'paid', payment_ref = ?, paid_at = datetime('now') WHERE id = ?`
    ).run(payment_ref ?? "manual-verified", req.params.id);

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    res.json({
        ...updated as any,
        download_url: `${FRONTEND_URL}/download/${order.download_token}`,
    });
});

/* ── Admin: reject order ─────────────────────────────────────────── */
router.patch("/:id/reject", requireAuth as any, (req, res) => {
    db.prepare("UPDATE orders SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
});

export default router;
