import { getRecentEvents } from "@/shared/lib/github/recent-events";

/** Same-origin proxy for the client-side "latest activity" list; keeps the token server-side. */
export async function GET() {
  const events = await getRecentEvents();
  return Response.json(events);
}
