import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Initialize Gemini SDK (GEMINI_API_KEY env)
const ai = new GoogleGenAI({});

// Define payment format normalizer helper
const mapPaymentFormat = (extracted: string): string => {
    const norm = (extracted || "").toLowerCase().replace(/[\s_-]/g, "");
    if (norm.includes("momo") || norm.includes("mobile") || norm.includes("money") || norm.includes("telecom")) {
        return "mobile_money";
    }
    if (norm.includes("card") || norm.includes("visa") || norm.includes("credit") || norm.includes("debit") || norm.includes("mastercard")) {
        return "credit_card";
    }
    if (norm.includes("bank") || norm.includes("transfer") || norm.includes("wire") || norm.includes("eft")) {
        return "bank_transfer";
    }
    return "cash";
};

// webhook handler to process document upload
router.post("/process-document", async (req, res) => {
    try {
        const { file_url } = req.body;
        if (!file_url) {
             res.status(400).json({ error: "Missing file_url parameter" });
             return;
        }

        console.log(`[Document Pipeline] Processing document URL: ${file_url}`);

        // Fetch document file blob
        const docRes = await fetch(file_url);
        if (!docRes.ok) {
             res.status(400).json({ error: `Failed to download file from URL: ${file_url}` });
             return;
        }

        const buffer = await docRes.arrayBuffer();
        const contentType = docRes.headers.get("content-type") || "application/pdf";
        const base64Data = Buffer.from(buffer).toString("base64");

        // Structured JSON Schema output request using Gemini 2.5 Flash
        const prompt = `You are a financial parsing assistant. Extract the transaction ledger data from the invoice or receipt document image/pdf provided.
Extract carefully, especially subtotal, VAT, invoice or receipt number, TIN number if available, and payment format.
If VAT is not explicitly mentioned, assume it is 0.
Under payment format, extract whether it is cash, mobile money/telecom, credit/debit card, or bank transfer.`;

        console.log("[Document Pipeline] Sending document to Gemini 2.5 Flash...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: contentType
                    }
                },
                prompt
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: {
                            type: Type.STRING,
                            description: "Whether this document represents a 'revenue' (income) or 'expense' (outgoing cost)"
                        },
                        date: {
                            type: Type.STRING,
                            description: "The transaction date in YYYY-MM-DD format"
                        },
                        vendor_client_name: {
                            type: Type.STRING,
                            description: "The vendor (seller) name for expenses, or client (buyer) name for revenue"
                        },
                        tin_number: {
                            type: Type.STRING,
                            description: "TIN number of the vendor/client if present on the document, or null"
                        },
                        invoice_receipt_no: {
                            type: Type.STRING,
                            description: "Invoice or receipt number, or null"
                        },
                        payment_format: {
                            type: Type.STRING,
                            description: "The mode of payment (e.g. mobile money, card, cash, bank transfer)"
                        },
                        currency: {
                            type: Type.STRING,
                            description: "Currency code (3 letters, e.g. UGX, USD, EUR). Default is UGX"
                        },
                        subtotal: {
                            type: Type.NUMBER,
                            description: "The subtotal amount before VAT"
                        },
                        vat_amount: {
                            type: Type.NUMBER,
                            description: "The VAT amount (tax). If not listed, specify 0"
                        }
                    },
                    required: ["type", "date", "vendor_client_name", "payment_format", "subtotal"]
                }
            }
        });

        const rawJsonText = response.text;
        console.log("[Document Pipeline] Gemini response:", rawJsonText);

        if (!rawJsonText) {
             res.status(500).json({ error: "Empty response from Gemini AI" });
             return;
        }

        const parsed = JSON.parse(rawJsonText);

        // Sanitize and normalize values
        const typeNormalized = parsed.type === "revenue" ? "revenue" : "expense";
        const dateRaw = parsed.date ? parsed.date.trim() : new Date().toISOString().substring(0, 10);
        const dateNormalized = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : new Date(dateRaw).toISOString().substring(0, 10);
        const nameNormalized = parsed.vendor_client_name || "Unknown Entity";
        const tinNormalized = parsed.tin_number || null;
        const invoiceNoNormalized = parsed.invoice_receipt_no || null;
        const paymentFormatNormalized = mapPaymentFormat(parsed.payment_format);
        const currencyNormalized = (parsed.currency || "UGX").toUpperCase().substring(0, 3);
        const subtotalNormalized = Number(parsed.subtotal) || 0;
        const vatAmountNormalized = Number(parsed.vat_amount) || 0;

        // Duplicate checks
        if (invoiceNoNormalized) {
            const duplicateCheck = await db.get(
                "SELECT id FROM transactions WHERE invoice_receipt_no = $1 AND vendor_client_name = $2",
                [invoiceNoNormalized, nameNormalized]
            );
            if (duplicateCheck) {
                console.log(`[Document Pipeline] Duplicate transaction detected. Skipping insert for Invoice/Receipt No: ${invoiceNoNormalized}`);
                res.status(200).json({
                    success: false,
                    message: "Duplicate transaction detected",
                    duplicate: true,
                    transaction: duplicateCheck
                });
                return;
            }
        }

        // Insert transaction record into database
        const insertRes = await db.query(
            `INSERT INTO transactions (type, date, vendor_client_name, tin_number, invoice_receipt_no, payment_format, currency, subtotal, vat_amount, file_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, total_amount`,
            [
                typeNormalized,
                dateNormalized,
                nameNormalized,
                tinNormalized,
                invoiceNoNormalized,
                paymentFormatNormalized,
                currencyNormalized,
                subtotalNormalized,
                vatAmountNormalized,
                file_url
            ]
        );

        const savedRecord = insertRes.rows[0];
        console.log(`[Document Pipeline] Successfully inserted transaction ledger record: ${savedRecord.id}`);

        res.status(200).json({
            success: true,
            transactionId: savedRecord.id,
            totalAmount: savedRecord.total_amount,
            extractedData: {
                type: typeNormalized,
                date: dateNormalized,
                vendor_client_name: nameNormalized,
                tin_number: tinNormalized,
                invoice_receipt_no: invoiceNoNormalized,
                payment_format: paymentFormatNormalized,
                currency: currencyNormalized,
                subtotal: subtotalNormalized,
                vat_amount: vatAmountNormalized,
                file_url
            }
        });
    } catch (err: any) {
        console.error("[Document Pipeline] Processing error:", err);
        res.status(500).json({
            error: "DOCUMENT_PIPELINE_ERROR",
            message: err.message
        });
    }
});

// Admin: retrieve list of transactions
router.get("/transactions", requireAuth as any, async (req, res) => {
    try {
        const transactions = await db.all("SELECT * FROM transactions ORDER BY date DESC, created_at DESC");
        res.json(transactions);
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// Admin: delete a transaction
router.delete("/transactions/:id", requireAuth as any, async (req, res) => {
    try {
        await db.run("DELETE FROM transactions WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to delete transaction" });
    }
});

export default router;
