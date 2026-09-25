import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, Plus } from "lucide-react"

import { prisma } from "@/lib/db"
import {
  TERROIRS,
  formatPrice,
  formatStyle,
  hasImage,
  imageUrl,
  wineListSelect,
} from "@/lib/wines"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PublishedSwitch } from "@/components/wines/wine-row-actions"

export const metadata: Metadata = {
  title: "Вина — Terroir Admin",
}

export default async function WinesPage() {
  const wines = await prisma.wine.findMany({
    select: wineListSelect,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
  const publishedCount = wines.filter((w) => w.published).length

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Витрина вин</h2>
          <p className="text-sm text-muted-foreground">
            На сайте: {publishedCount} из {wines.length}. Порядок в таблице совпадает с порядком на витрине.
          </p>
        </div>
        <Button asChild>
          <Link href="/wines/new">
            <Plus />
            Добавить вино
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        {wines.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
            Вин пока нет — витрина на сайте покажет пустое состояние.
            <Button asChild variant="outline">
              <Link href="/wines/new">Добавить первое вино</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="hidden md:table-cell">Терруар</TableHead>
                <TableHead className="hidden md:table-cell">Стиль</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Порядок</TableHead>
                <TableHead className="pr-4 text-right">На сайте</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wines.map((wine) => (
                <TableRow key={wine.id} className={wine.published ? undefined : "text-muted-foreground"}>
                  <TableCell className="pl-4">
                    <div className="relative size-10 overflow-hidden rounded bg-muted">
                      {hasImage(wine) ? (
                        <Image src={imageUrl(wine)} alt="" fill unoptimized className="object-cover" />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/wines/${wine.id}`} className="font-medium hover:underline">
                      {wine.name}
                    </Link>
                    {!wine.published && (
                      <Badge variant="outline" className="ml-2">скрыто</Badge>
                    )}
                    <div className="text-xs text-muted-foreground md:hidden">
                      {TERROIRS[wine.terroir].label} · {formatStyle(wine)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{TERROIRS[wine.terroir].label}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatStyle(wine)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(wine.price)}</TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">{wine.sortOrder}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <PublishedSwitch id={wine.id} published={wine.published} name={wine.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
