/**
 * Flutterwave Mobile Money Uganda integration.
 *
 * Supports MTN MoMo and Airtel Money via the Flutterwave v3 API.
 * When FLW_SECRET_KEY is empty, falls back to manual payment mode
 * (user sends MoMo manually, admin verifies).
 */

const FLW_BASE = "https://api.flutterwave.com/v3";

interface MoMoChargeParams {
    txRef: string;
    amount: number;
    currency: "UGX";
    phone: string;
    network: "MTN" | "AIRTEL";
    email: string;
    name: string;
    description: string;
    callbackUrl: string;
}

interface FlwChargeResponse {
    status: string;
    message: string;
    data?: {
        id: number;
        tx_ref: string;
        flw_ref: string;
        status: string;
    };
}

export function isFlutterwaveConfigured(): boolean {
    return Boolean(process.env.FLW_SECRET_KEY);
}

export async function initiateMoMoCharge(params: MoMoChargeParams): Promise<FlwChargeResponse> {
    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Flutterwave not configured. Use manual payment mode.");
    }

    const body = {
        tx_ref: params.txRef,
        amount: params.amount,
        currency: params.currency,
        phone_number: params.phone,
        network: params.network,
        email: params.email,
        fullname: params.name,
        narration: params.description,
        redirect_url: params.callbackUrl,
        meta: {
            source: "wachaai-music",
        },
    };

    const res = await fetch(`${FLW_BASE}/charges?type=mobile_money_uganda`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    return (await res.json()) as FlwChargeResponse;
}

export async function verifyTransaction(transactionId: number): Promise<FlwChargeResponse> {
    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) throw new Error("Flutterwave not configured");

    const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${secretKey}` },
    });

    return (await res.json()) as FlwChargeResponse;
}

export function getManualPaymentInfo() {
    return {
        phone: process.env.PAYMENT_PHONE ?? "0704650600",
        name: process.env.PAYMENT_NAME ?? "Peter Wacha",
        network: process.env.PAYMENT_NETWORK ?? "Airtel",
    };
}
