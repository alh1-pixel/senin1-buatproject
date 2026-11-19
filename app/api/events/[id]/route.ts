import { ambilEvent } from "@/data/ambil";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/events/[id]">,
) {
  const { id } = await ctx.params;
  const event = await ambilEvent(Number(id));

  if (!event) {
    return Response.json({ pesan: "Event tidak ditemukan" }, { status: 404 });
  }
  return Response.json(event);
}
