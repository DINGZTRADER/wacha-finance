import { Router } from "express";
import db from "../db.js";

const router = Router();
const WEBHOOK_HASH = process.env.FLW_WEBHOOK_HASH;

/**
 * Flutterwave webhook handler.
 * Receives payment confirmation and auto-approves orders/commissions.
 */
router.post("/webhook", async (req, res) => {
    // Verify webhook source
    if (WEBHOOK_HASH && req.headers["verif-hash"] !== WEBHOOK_HASH) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const { event, data } = req.body;

    if (event === "charge.completed" && data?.status === "successful") {
        const txRef = data.tx_ref as string;

        if (txRef.startsWith("COM-")) {
            // Commission deposit payment
            const commId = txRef.slice(4);
            await db.run(
                `UPDATE commissions SET
                    status = 'deposit_paid',
                    payment_ref = $1,
                    flw_ref = $2,
                    paid_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [data.flw_ref, data.flw_ref, commId]
            );
        } else {
            // Song purchase payment
            await db.run(
                `UPDATE orders SET
                    status = 'paid',
                    payment_ref = $1,
                    flw_ref = $2,
                    paid_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [data.flw_ref, data.flw_ref, txRef]
            );
        }
    }

    // Always respond 200 to acknowledge receipt
    res.json({ status: "ok" });
});

export default router;
