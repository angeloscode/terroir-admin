import { prisma } from "@/lib/db"
import { toPublicWine, wineListSelect } from "@/lib/wines"

// Публичный список вин для витрины сайта (WineCollection.astro).
// Отдаём только опубликованные, в порядке sortOrder; данные уже готовы к выводу.
export async function GET() {
  const wines = await prisma.wine.findMany({
    where: { published: true },
    select: wineListSelect,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return Response.json(wines.map(toPublicWine), {
    // правки в админке видны на сайте сразу после обновления страницы
    headers: { "Cache-Control": "no-store" },
  })
}
