Markdown
# Implementation Plan: Automated Financial Ingestion & Reporting System

This document outlines the step-by-step engineering plan to build an event-driven invoice/receipt extraction pipeline, financial dashboard, and automated email reporting system for **wachaai.com**.

---

## 🛠️ System Overview & Architecture

- **Domain:** `wachaai.com` (Subdomain: `dashboard.wachaai.com` / `api.wachaai.com`)
- **Frontend & Routing:** Next.js (App Router) deployed on Vercel
- **Database & Storage:** Supabase (PostgreSQL + Object Storage)
- **AI Extraction Engine:** Gemini 2.5 Flash via `@google/genai`
- **Email Dispatcher:** Resend or Postmark via Cron Job Scheduler

---

## 📅 Phased Implementation Roadmap

### Phase 1: Infrastructure & Database Provisioning
- [ ] **DNS Configuration:** 
  - Point `dashboard.wachaai.com` to your Next.js deployment platform (e.g., Vercel CNAME records).
- [ ] **Supabase Setup:**
  - Create a production database instance.
  - Create a storage bucket named `financial-documents` and set its privacy rules to authenticated or secure read-only.
- [ ] **Database Schema:** Run the following migration script to set up the ledger:
  ```sql
  CREATE TYPE transaction_type AS ENUM ('revenue', 'expense');
  CREATE TYPE payment_method AS ENUM ('mobile_money', 'credit_card', 'cash', 'bank_transfer');

  CREATE TABLE transactions (
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
Phase 2: AI-Powered Extraction Pipeline (The Webhook Handler)
[ ] Environment Variables: Securely store GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.

[ ] API Endpoint (/api/process-document): Create the serverless handler that runs automatically on file upload.

Downloads the document payload from the storage trigger.

Converts the file blob into base64 format.

Invokes gemini-2.5-flash using Structured Outputs to enforce strict JSON validation matching the database parameters.

Sanitizes the extracted fields (normalizing ENUMs like payment_format).

Writes the finalized record into the transactions table.

[ ] Storage Webhook Registration: Link the Supabase Storage INSERT trigger event to ping https://api.wachaai.com/api/process-document.

Phase 3: Financial Dashboard UI
[ ] Summary Analytics Grid:

Display KPI cards for Total Revenue, Total Expenses, and Net Difference (Profit/Loss).

[ ] Interactive Ledger Table:

Standardized listing of all extracted rows (Date, Client Name, Type, Invoice No, Total Amount).

Include an audit feature: a quick link/modal previewing the original uploaded receipt/invoice file next to its corresponding entry.

Status indicators or flags for rows where data extraction certainty or compliance requirements (like missing TIN values) need human review.

Phase 4: Automated Chron Email Digest
[ ] Reporting Engine: Write a decoupled script that queries data within the selected reporting timeline window, computes aggregate financial differences, and formats a clean, scannable HTML summary table.

[ ] Recipient Dispatch Routing: Hardcode email delivery routes to send directly to:

wachaexperience@gmail.com

masspolovisuals@gmail.com

[ ] Cron Execution: Configure a serverless cron utility (e.g., Vercel Crons or GitHub Actions) to hit the reporting route at your preferred weekly or monthly timestamps.

🔒 Security, Compliance, & Extras
Duplicate Detection: Include logic to prevent double-billing or duplicate records by scanning for matching invoice_receipt_no and vendor_client_name sets prior to SQL execution.

Audit Logging: Maintain a tight one-to-one mapping between the physical cloud asset (file_url) and the financial record ledger database state.


***

