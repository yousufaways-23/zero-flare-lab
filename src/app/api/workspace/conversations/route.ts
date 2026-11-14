// GET/POST /api/workspace/conversations — durable CIR-1 conversation log
// (M10/ADR-014). GET without sessionId lists sessions; with sessionId returns
// that conversation. POST appends one validated turn.
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendMessage, listMessages, listSessions } from "@/lib/db/workspace";

export const runtime = "nodejs";

const MessageSchema = z.object({
  sessionId: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
  mode: z.string().max(40).nullish(),
  toolTrace: z.string().max(20000).nullish(),
  createdAt: z.string().max(40),
});

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  try {
    if (!sessionId) {
      return NextResponse.json({ sessions: await listSessions(100) });
    }
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(sessionId)) {
      return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
    }
    return NextResponse.json({ messages: await listMessages(sessionId, 400) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = MessageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid message", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  try {
    await appendMessage(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
