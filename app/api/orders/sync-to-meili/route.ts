import { Meilisearch } from "meilisearch";

/**
 * TEMPORARY — manual sync endpoint for testing only, until the real
 * Firestore -> Meili sync (Cloud Function, syncOrdersToMeili.ts) is deployed.
 * Delete this whole route once that's live; 

 */
const host = process.env.MEILI_HOST;
const tempAdminKey = process.env.MEILI_ADMIN_API_KEY;

export async function POST(req: Request) {
  if (!host || !tempAdminKey) {
    return Response.json(
      { error: "MEILI_HOST and MEILI_ADMIN_API_KEY must be set" },
      { status: 500 }
    );
  }

  try {
    const { order } = await req.json();
    if (!order?.id) {
      return Response.json({ error: "Missing order.id" }, { status: 400 });
    }

    const client = new Meilisearch({ host, apiKey: tempAdminKey });
    const doc = { ...order, hasDriver: !!order.assignedDriverId };

    await client.index("orders").addDocuments([doc]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Manual Meili sync failed:", err);
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}