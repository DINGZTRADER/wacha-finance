import { Router } from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { isFlutterwaveConfigured, initiateMoMoCharge, getManualPaymentInfo } from "../utils/flutterwave.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

/* ── Public: submit commission request ───────────────────────────── */
router.post("/", async (req, res) => {
    try {
        const {
            client_name,
            client_phone,
            client_email,
            description,
            genre,
            reference_links,
            pay_deposit,
            payment_method,
        } = req.body;

        if (!client_name || !client_phone || !description) {
            res.status(400).json({ error: "Name, phone, and description are required" });
            return;
        }

        const id = uuid();
        const fullAmount = 150_000;
        const depositAmount = pay_deposit ? 75_000 : 0; // 50% deposit

        db.prepare(
            `INSERT INTO commissions (id, client_name, client_phone, client_email, description, genre, reference_links, amount, deposit_amount, payment_method)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            id,
            client_name,
            client_phone,
            client_email ?? null,
            description,
            genre ?? null,
            reference_links ?? null,
            fullAmount,
            depositAmount,
            payment_method ?? null
        );

        // If paying deposit, initiate payment
        if (pay_deposit && depositAmount > 0) {
            if (isFlutterwaveConfigured() && payment_method) {
                const network = payment_method === "airtel" ? "AIRTEL" : "MTN";
                const charge = await initiateMoMoCharge({
                    txRef: `COM-${id}`,
                    amount: depositAmount,
                    currency: "UGX",
                    phone: client_phone,
                    network,
                    email: client_email ?? `${client_phone}@wachaai.com`,
                    name: client_name,
                    description: "Music Commission Deposit — WachaAI",
                    callbackUrl: `${FRONTEND_URL}/commission/success`,
                });

                if (charge.data?.flw_ref) {
                    db.prepare("UPDATE commissions SET flw_ref = ? WHERE id = ?").run(
                        charge.data.flw_ref,
                        id
                    );
                }

                res.status(201).json({
                    commission_id: id,
                    payment_mode: "automated",
                    deposit: depositAmount,
                    flutterwave: charge,
                    message: "Commission submitted! A payment prompt for the deposit has been sent to your phone.",
                });
                return;
            }

            // Manual deposit payment
            const paymentInfo = getManualPaymentInfo();
            res.status(201).json({
                commission_id: id,
                payment_mode: "manual",
                deposit: depositAmount,
                payment_info: {
                    ...paymentInfo,
                    reference: `COM-${id.slice(0, 6).toUpperCase()}`,
                    instructions: `Send UGX ${depositAmount.toLocaleString()} deposit to ${paymentInfo.network} ${paymentInfo.phone} (${paymentInfo.name}). Reference: COM-${id.slice(0, 6).toUpperCase()}`,
                },
                message: "Commission submitted! Send the deposit via Mobile Money to confirm.",
            });
            return;
        }

        // No deposit — just submit the request
        res.status(201).json({
            commission_id: id,
            message: "Commission request submitted! We'll contact you within 24 hours to discuss details.",
        });
    } catch (err) {
        console.error("Commission creation error:", err);
        res.status(500).json({ error: "Failed to submit commission" });
    }
});

/* ── Admin: list all commissions ─────────────────────────────────── */
router.get("/", requireAuth as any, (_req, res) => {
    const commissions = db
        .prepare("SELECT * FROM commissions ORDER BY created_at DESC")
        .all();
    res.json(commissions);
});

/* ── Admin: update commission status ─────────────────────────────── */
router.patch("/:id", requireAuth as any, (req, res) => {
    const { status, admin_notes, payment_ref } = req.body;
    const existing = db.prepare("SELECT * FROM commissions WHERE id = ?").get(req.params.id);
    if (!existing) {
        res.status(404).json({ error: "Commission not found" });
        return;
    }

    db.prepare(
        `UPDATE commissions SET
            status = COALESCE(?, status),
            admin_notes = COALESCE(?, admin_notes),
            payment_ref = COALESCE(?, payment_ref),
            paid_at = CASE WHEN ? IN ('deposit_paid', 'fully_paid') THEN datetime('now') ELSE paid_at END
         WHERE id = ?`
    ).run(status, admin_notes, payment_ref, status, req.params.id);

    const commission = db.prepare("SELECT * FROM commissions WHERE id = ?").get(req.params.id);
    res.json(commission);
});

export default router;
