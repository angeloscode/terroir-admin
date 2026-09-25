import type { ImagePosition, Prisma, Terroir, Wine, WineColor, WineSweetness } from "@prisma/client"
import * as z from "zod"

// ---------- Справочники: подписи для админки и сайта ----------

// key — значение data-terroir / data-wine-filter в вёрстке WineCollection.astro
export const TERROIRS: Record<Terroir, { label: string; key: string }> = {
  MEZYB: { label: "Мезыбь", key: "mezyb" },
  ROCKY_SHORE: { label: "Скалистый берег", key: "rocky" },
}

export const COLORS: Record<WineColor, string> = {
  RED: "Красное",
  WHITE: "Белое",
  ROSE: "Розовое",
  ORANGE: "Оранжевое",
  SPARKLING: "Игристое",
}

export const SWEETNESS: Record<WineSweetness, string> = {
  DRY: "сухое",
  SEMI_DRY: "полусухое",
  SEMI_SWEET: "полусладкое",
  SWEET: "сладкое",
}

export const IMAGE_POSITIONS: Record<ImagePosition, string> = {
  LEFT: "Левая часть",
  CENTER: "Центр",
  RIGHT: "Правая часть",
}

// Intl для ru-RU разделяет разряды узким неразрывным пробелом (U+202F) —
// приводим к обычному, как в вёрстке сайта («3 200 ₽»)
export const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("ru-RU").format(price).replace(/\s/g, " ")} ₽`

export const formatStyle = (wine: Pick<Wine, "color" | "sweetness">) =>
  `${COLORS[wine.color]} · ${SWEETNESS[wine.sweetness]}`

// ---------- Фото ----------

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const imageUrl = (wine: Pick<Wine, "id" | "updatedAt">) =>
  `/admin/api/wines/${wine.id}/image?v=${wine.updatedAt.getTime()}`

// ---------- Валидация формы ----------

const keys = <T extends string>(record: Record<T, unknown>) =>
  Object.keys(record) as [T, ...T[]]

export const wineSchema = z.object({
  name: z.string().trim().min(1, "Введите название").max(80, "Не длиннее 80 символов"),
  price: z.coerce
    .number({ error: "Введите цену" })
    .int("Цена — целое число рублей")
    .min(0, "Цена не может быть отрицательной")
    .max(10_000_000, "Слишком большая цена"),
  terroir: z.enum(keys(TERROIRS), { error: "Выберите терруар" }),
  color: z.enum(keys(COLORS), { error: "Выберите цвет" }),
  sweetness: z.enum(keys(SWEETNESS), { error: "Выберите сладость" }),
  imagePosition: z.enum(keys(IMAGE_POSITIONS)),
  sortOrder: z.coerce.number({ error: "Введите число" }).int("Целое число"),
  published: z.boolean(),
})

export type WineInput = z.infer<typeof wineSchema>

// ---------- Выборка без байтов фото (для списков и API) ----------

export const wineListSelect = {
  id: true,
  name: true,
  price: true,
  terroir: true,
  color: true,
  sweetness: true,
  imagePosition: true,
  imageType: true,
  published: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WineSelect

export type WineListItem = Prisma.WineGetPayload<{ select: typeof wineListSelect }>

export const hasImage = (wine: Pick<Wine, "imageType">) => wine.imageType !== null

// ---------- Формат для сайта (GET /admin/api/wines) ----------

export type PublicWine = {
  id: string
  name: string
  price: string
  terroir: { key: string; label: string }
  style: string
  position: "left" | "center" | "right"
  image: string | null
}

export const toPublicWine = (wine: WineListItem): PublicWine => ({
  id: wine.id,
  name: wine.name,
  price: formatPrice(wine.price),
  terroir: TERROIRS[wine.terroir],
  style: formatStyle(wine),
  position: wine.imagePosition.toLowerCase() as PublicWine["position"],
  image: hasImage(wine) ? imageUrl(wine) : null,
})
