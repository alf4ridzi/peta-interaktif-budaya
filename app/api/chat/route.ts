import { NextRequest, NextResponse } from "next/server";
import { processCultureChat } from "@/lib/ai/culture-rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const targetSlug = typeof body.targetSlug === "string" ? body.targetSlug.trim() : undefined;
    const history = Array.isArray(body.history) ? body.history : [];

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Pertanyaan minimal terdiri dari 2 karakter.",
        },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Pertanyaan melebihi batas maksimal 1.000 karakter.",
        },
        { status: 400 }
      );
    }

    const payload = await processCultureChat(query, targetSlug, history);

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kendala saat memproses jawaban AI. Silakan coba sesaat lagi.",
      },
      { status: 500 }
    );
  }
}

