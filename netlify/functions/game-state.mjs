import { getStore } from "@netlify/blobs";

// One shared game, no accounts — this is meant for exactly one team with a
// couple of coaches who both need to see the same live state, nothing more.
const KEY = "current-game";

export default async (req) => {
  // Strong consistency: this store sees far too little traffic to need the
  // performance tradeoff eventual consistency exists for, and a coach's own
  // action should never appear to have been lost on the very next poll.
  const store = getStore({ name: "sideline", consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return Response.json(data || null);
  }

  if (req.method === "POST") {
    const body = await req.json();
    await store.setJSON(KEY, body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/game-state" };
