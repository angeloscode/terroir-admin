import type { Metadata } from "next"

import { prisma } from "@/lib/db"
import { WineForm } from "@/components/wines/wine-form"

export const metadata: Metadata = {
  title: "Новое вино — Terroir Admin",
}

export default async function NewWinePage() {
  // новое вино по умолчанию встаёт в конец витрины
  const last = await prisma.wine.aggregate({ _max: { sortOrder: true } })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <h2 className="text-xl font-semibold">Новое вино</h2>
      <WineForm
        defaults={{
          name: "",
          price: "",
          terroir: "",
          color: "",
          sweetness: "DRY",
          imagePosition: "CENTER",
          sortOrder: String((last._max.sortOrder ?? 0) + 10),
          published: true,
          imageUrl: null,
        }}
      />
    </div>
  )
}
