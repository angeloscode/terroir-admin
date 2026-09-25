import { prisma } from "@/lib/db"

// Фото вина из БД. URL содержит ?v=<updatedAt>, поэтому кэшируем надолго:
// после замены фото меняется и адрес.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const wine = await prisma.wine.findUnique({
    where: { id },
    select: { image: true, imageType: true },
  })

  if (!wine?.image || !wine.imageType) {
    return new Response("Not found", { status: 404 })
  }

  return new Response(new Uint8Array(wine.image), {
    headers: {
      "Content-Type": wine.imageType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
