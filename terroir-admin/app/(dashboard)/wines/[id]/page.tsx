import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
import { hasImage, imageUrl, wineListSelect } from "@/lib/wines"
import { WineForm } from "@/components/wines/wine-form"
import { DeleteWineButton } from "@/components/wines/wine-row-actions"

export const metadata: Metadata = {
  title: "Редактирование вина — Terroir Admin",
}

export default async function EditWinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const wine = await prisma.wine.findUnique({ where: { id }, select: wineListSelect })
  if (!wine) notFound()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{wine.name}</h2>
        <DeleteWineButton id={wine.id} name={wine.name} />
      </div>
      <WineForm
        defaults={{
          id: wine.id,
          name: wine.name,
          price: String(wine.price),
          terroir: wine.terroir,
          color: wine.color,
          sweetness: wine.sweetness,
          imagePosition: wine.imagePosition,
          sortOrder: String(wine.sortOrder),
          published: wine.published,
          imageUrl: hasImage(wine) ? imageUrl(wine) : null,
        }}
      />
    </div>
  )
}
