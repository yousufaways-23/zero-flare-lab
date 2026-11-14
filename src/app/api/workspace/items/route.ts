// GET/POST/DELETE /api/workspace/items — durable My Work shelf (M10/ADR-014).
// Zod-validated; server-side JSONL store (see src/lib/db/workspace.ts).
import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSavedItem, listSavedItems, upsertSavedItem } from "@/lib/db/workspace";

export const runtime = "nodejs";

const ItemSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/),
  kind: z.enum(["investigation", "dataset", "gap", "equation", "chart", "source", "media", "scenario", "equipment"]),
  label: z.string().min(1).max(200),
  detail: z.string().max(2000).nullish(),
  url: z.string().max(400).nullish(),
  note: z.string().max(4000).nullish(),
  savedAt: z.string().max(40),
});

export async function GET() {
  try {
    return NextResponse.json({ items: await listSavedItems(500) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = ItemSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid item", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  try {
    await upsertSavedItem(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const removed = await deleteSavedItem(id);
    return NextResponse.json({ ok: removed });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
