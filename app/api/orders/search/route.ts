import { meili } from "@/lib/meili/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);

  const filter = searchParams.get("filter") ?? undefined;

  try {
    const result = await meili.index("orders").search(q, {
      limit,
      offset,
      ...(filter ? { filter } : {}),
    });

    return Response.json({
      hits: result.hits,
      estimatedTotalHits: result.estimatedTotalHits,
    });
  } catch (err) {
    console.error("Meilisearch query failed:", err);
    return Response.json(
      { error: "Search failed", hits: [], estimatedTotalHits: 0 },
      { status: 500 }
    );
  }
}