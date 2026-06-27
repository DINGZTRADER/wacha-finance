import pg from '../node_modules/pg/lib/index.js';
const { Client } = pg;

const connectionString = "postgres://postgres.lvbblxadgxajnfdjipfr:GyA6CPBggeBh0j56@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=no-verify";

async function migrate() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log("Connected to PostgreSQL database.");

        // Create types if they do not exist
        await client.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
                    CREATE TYPE transaction_type AS ENUM ('revenue', 'expense');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
                    CREATE TYPE payment_method AS ENUM ('mobile_money', 'credit_card', 'cash', 'bank_transfer');
                END IF;
            END $$;
        `);
        console.log("Custom enum types verified.");

        // Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type transaction_type NOT NULL,
                date DATE NOT NULL,
                vendor_client_name VARCHAR(255) NOT NULL,
                tin_number VARCHAR(50),
                invoice_receipt_no VARCHAR(100),
                payment_format payment_method NOT NULL,
                currency VARCHAR(3) DEFAULT 'UGX',
                subtotal NUMERIC(15, 2) NOT NULL,
                vat_amount NUMERIC(15, 2) DEFAULT 0.00,
                total_amount NUMERIC(15, 2) GENERATED ALWAYS AS (subtotal + vat_amount) STORED,
                file_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("transactions table verified/created.");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await client.end();
    }
}

migrate();
