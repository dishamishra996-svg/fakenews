import { NextRequest, NextResponse } from "next/server";

// ── Database Schema (reference) ─────────────────────────────────────────────
//
// This file documents the off-chain database schema for TrustCheck.
// Implement with PostgreSQL, MongoDB, or your preferred DB.
//
// ────────────────────────────────────────────────────────────────────────────
//
// -- PostgreSQL Schema --
//
// CREATE TABLE users (
//     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     stellar_address VARCHAR(56) UNIQUE NOT NULL,
//     reputation      INTEGER DEFAULT 0,
//     created_at      TIMESTAMPTZ DEFAULT NOW(),
//     last_active     TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX idx_users_stellar ON users(stellar_address);
//
// CREATE TABLE content_metadata (
//     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     content_id      VARCHAR(64) UNIQUE NOT NULL,
//     content_hash    VARCHAR(256) NOT NULL,
//     content_type    VARCHAR(16) NOT NULL,
//     submitter       VARCHAR(56) NOT NULL,
//     title           TEXT,
//     description     TEXT,
//     url             TEXT,
//     created_at      TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX idx_content_id ON content_metadata(content_id);
//
// CREATE TABLE verifications (
//     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     content_id      VARCHAR(64) NOT NULL REFERENCES content_metadata(content_id),
//     verifier        VARCHAR(56) NOT NULL,
//     score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
//     created_at      TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX idx_verifications_content ON verifications(content_id);
//
// CREATE TABLE trusted_sources (
//     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     stellar_address VARCHAR(56) UNIQUE NOT NULL,
//     name            VARCHAR(128) NOT NULL,
//     url             TEXT,
//     added_by        VARCHAR(56) NOT NULL,
//     active          BOOLEAN DEFAULT TRUE,
//     created_at      TIMESTAMPTZ DEFAULT NOW()
// );
//
// ────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "status":
      return NextResponse.json({
        network: "Stellar Testnet",
        rpc: "https://soroban-testnet.stellar.org",
        status: "operational",
        chain: "Stellar Soroban",
      });

    case "stats":
      // Placeholder for aggregated stats from DB
      return NextResponse.json({
        totalContent: null,
        totalUsers: null,
        totalVerifications: null,
        note: "On-chain data available via contract read methods. Extend this endpoint with DB integration.",
      });

    default:
      return NextResponse.json({
        endpoints: {
          "/api/contract?action=status": "Network status",
          "/api/contract?action=stats": "Platform statistics",
        },
      });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "log_verification": {
        const { contentId, verifier, score } = body;
        if (!contentId || !verifier || score === undefined) {
          return NextResponse.json(
            { error: "Missing fields: contentId, verifier, score" },
            { status: 400 }
          );
        }
        // Log verification to database
        return NextResponse.json({
          success: true,
          message: "Verification logged",
        });
      }

      case "track_user": {
        const { stellarAddress } = body;
        if (!stellarAddress) {
          return NextResponse.json(
            { error: "stellarAddress required" },
            { status: 400 }
          );
        }
        // Upsert user in database
        return NextResponse.json({
          success: true,
          message: "User activity tracked",
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
