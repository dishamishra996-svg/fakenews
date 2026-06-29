import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentHash, contentType } = body;

    if (!contentId || !contentHash || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: contentId, contentHash, contentType" },
        { status: 400 }
      );
    }

    // This API endpoint is a proxy — the actual submission
    // happens client-side via Freighter wallet signing.
    // This endpoint can be extended for:
    //   - IPFS/Arweave content storage
    //   - Content hash generation
    //   - Database logging
    //   - Notification dispatch
    //   - AI content analysis pipeline

    return NextResponse.json({
      success: true,
      message: "Content submission prepared",
      data: { contentId, contentHash, contentType },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint to retrieve content metadata
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json(
      { error: "contentId query parameter required" },
      { status: 400 }
    );
  }

  // Placeholder for backend database lookup
  // Extend this with a PostgreSQL/MongoDB integration

  return NextResponse.json({
    contentId,
    note: "Content data is stored on-chain. Use the contract's get_content method.",
  });
}
