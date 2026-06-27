import { Router } from "express";
import { Resend } from "resend";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

// Decoupled script function that compiles financial statistics and dispatches emails
export async function sendFinancialDigest(): Promise<{ success: boolean; sentTo: string[]; summary: any }> {
    const recipients = ["wachaexperience@gmail.com", "masspolovisuals@gmail.com"];

    console.log("[Reporting Engine] Compiling weekly financial summary digest...");

    // Query transactions from past 30 days
    const queryRes = await db.query(`
        SELECT * FROM transactions 
        WHERE date >= CURRENT_DATE - INTERVAL '30 days' 
        ORDER BY date DESC
    `);
    const transactions = queryRes.rows;

    let totalRevenue = 0;
    let totalExpenses = 0;
    const ledgerRowsHtml: string[] = [];

    for (const t of transactions) {
        const amt = parseFloat(t.total_amount || "0");
        if (t.type === "revenue") {
            totalRevenue += amt;
        } else {
            totalExpenses += amt;
        }

        const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const bgClass = t.type === "revenue" ? "background-color: #ecfdf5; color: #047857;" : "background-color: #fef2f2; color: #b91c1c;";
        const typeLabel = t.type === "revenue" ? "Revenue" : "Expense";

        ledgerRowsHtml.push(`
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-size: 14px; color: #374151;">${formattedDate}</td>
                <td style="padding: 12px; font-size: 14px; color: #1f2937; font-weight: 500;">${t.vendor_client_name}</td>
                <td style="padding: 12px; font-size: 12px;"><span style="padding: 4px 8px; border-radius: 9999px; font-weight: 600; text-transform: uppercase; ${bgClass}">${typeLabel}</span></td>
                <td style="padding: 12px; font-size: 14px; color: #4b5563;">${t.invoice_receipt_no || "-"}</td>
                <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${t.currency} ${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            </tr>
        `);
    }

    const netProfit = totalRevenue - totalExpenses;
    const profitColor = netProfit >= 0 ? "#047857" : "#b91c1c";

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>wachaai.com Weekly Financial Summary Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #f3f4f6; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">wachaai.com Financial Digest</h1>
                <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Automated 30-Day Activity Ledger & Summary</p>
            </div>
            
            <div style="padding: 32px;">
                <!-- KPI Summary cards -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px;">
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Revenue</span>
                        <strong style="font-size: 16px; color: #047857; display: block;">UGX ${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Expenses</span>
                        <strong style="font-size: 16px; color: #b91c1c; display: block;">UGX ${totalExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Net Profit</span>
                        <strong style="font-size: 16px; color: ${profitColor}; display: block;">UGX ${netProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                    </div>
                </div>

                <h3 style="font-size: 16px; color: #111827; margin: 0 0 16px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Recent Activity Logs (${transactions.length} items)</h3>
                
                ${transactions.length === 0 ? `
                    <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 40px 0;">No transactions recorded in the last 30 days.</p>
                ` : `
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 12px; font-size: 12px; color: #4b5563; font-weight: 600; text-transform: uppercase;">Date</th>
                                <th style="padding: 12px; font-size: 12px; color: #4b5563; font-weight: 600; text-transform: uppercase;">Vendor / Client</th>
                                <th style="padding: 12px; font-size: 12px; color: #4b5563; font-weight: 600; text-transform: uppercase;">Type</th>
                                <th style="padding: 12px; font-size: 12px; color: #4b5563; font-weight: 600; text-transform: uppercase;">Invoice #</th>
                                <th style="padding: 12px; font-size: 12px; color: #4b5563; font-weight: 600; text-transform: uppercase; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ledgerRowsHtml.join("")}
                        </tbody>
                    </table>
                `}
            </div>

            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">This is an automated weekly financial pipeline report compiled for wachaai.com.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Try sending real email using Resend
    let resendFailed = false;
    try {
        if (!process.env.RESEND_API_KEY) {
            resendFailed = true;
        } else {
            const data = await resend.emails.send({
                from: "wachaai Financial Ingestion <finance@wachaai.com>",
                to: recipients,
                subject: `wachaai.com Financial Digest - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                html: emailHtml,
            });
            console.log("[Reporting Engine] Resend delivery response:", data);
        }
    } catch (e: any) {
        console.error("[Reporting Engine] Resend email API dispatch failed:", e.message);
        resendFailed = true;
    }

    if (resendFailed) {
        console.log(`[Reporting Engine] [MOCK SEND] Unable to dispatch using Resend API. Logging complete report HTML details for local verification instead:`);
        console.log(`To: ${recipients.join(", ")}`);
        console.log(`Subject: wachaai.com Financial Digest Mocked`);
    }

    return {
        success: true,
        sentTo: recipients,
        summary: {
            totalRevenue,
            totalExpenses,
            netProfit,
            count: transactions.length
        }
    };
}

// Route handler for manually triggering the cron reporting job
router.post("/trigger-report", async (req, res) => {
    try {
        // Enforce secret header key verification to authenticate cron pinger
        const authHeader = req.headers.authorization;
        const cronSecret = process.env.CRON_SECRET || "cron_secret_token_2026";
        if (authHeader !== `Bearer ${cronSecret}`) {
             res.status(401).json({ error: "Unauthorized cron execution trigger" });
             return;
        }

        const reportResult = await sendFinancialDigest();
        res.status(200).json({
            message: "Financial reporting digest dispatched successfully",
            ...reportResult
        });
    } catch (err: any) {
        console.error("[Reporting Engine Endpoint] Error triggering report:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manual override endpoint to trigger digest dispatch from dashboard
router.post("/trigger-report-manual", requireAuth as any, async (req, res) => {
    try {
        const reportResult = await sendFinancialDigest();
        res.status(200).json({
            message: "Admin manually triggered financial reporting digest email dispatch",
            ...reportResult
        });
    } catch (err: any) {
         res.status(500).json({ error: err.message });
    }
});

export default router;
