"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { IMAGE_MAX_BYTES, IMAGE_TYPES, wineSchema } from "@/lib/wines"

// Server Action — публичный эндпоинт: роль проверяем в каждом действии, а не только в layout
async function requireAdmin() {
  const user = await getCurrentUser()
  if (user?.role !== "ADMIN") throw new Error("Недостаточно прав")
}

export type WineFormState = {
  errors?: Partial<Record<string, string>>
  message?: string
  // введённые значения — чтобы форма не сбрасывалась при ошибке
  values?: Record<string, string>
  submittedAt?: number
}

const FIELDS = ["name", "price", "terroir", "color", "sweetness", "imagePosition", "sortOrder"] as const

export async function saveWine(
  _prev: WineFormState,
  formData: FormData
): Promise<WineFormState> {
  await requireAdmin()

  const id = formData.get("id")?.toString() || null
  const values = Object.fromEntries(
    FIELDS.map((key) => [key, formData.get(key)?.toString() ?? ""])
  )
  values.published = formData.get("published") === "on" ? "on" : ""
  const fail = (errors: WineFormState["errors"], message = "Проверьте поля формы") => ({
    errors,
    message,
    values,
    submittedAt: Date.now(),
  })

  const parsed = wineSchema.safeParse({ ...values, published: values.published === "on" })
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      errors[key] ??= issue.message
    }
    return fail(errors)
  }

  // Фото: новое заменяет старое, флажок removeImage — удаляет
  const file = formData.get("image")
  let image: { image: Buffer | null; imageType: string | null } | undefined
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) {
      return fail({ image: "Поддерживаются JPEG, PNG и WebP" })
    }
    if (file.size > IMAGE_MAX_BYTES) {
      return fail({ image: "Фото больше 5 МБ" })
    }
    image = { image: Buffer.from(await file.arrayBuffer()), imageType: file.type }
  } else if (formData.get("removeImage") === "on") {
    image = { image: null, imageType: null }
  }

  const data = { ...parsed.data, ...image }

  if (id) {
    await prisma.wine.update({ where: { id }, data })
  } else {
    await prisma.wine.create({ data })
  }

  revalidatePath("/wines")
  redirect("/wines")
}

export async function deleteWine(id: string) {
  await requireAdmin()
  await prisma.wine.delete({ where: { id } })
  revalidatePath("/wines")
  redirect("/wines")
}

export async function setWinePublished(id: string, published: boolean) {
  await requireAdmin()
  await prisma.wine.update({ where: { id }, data: { published } })
  revalidatePath("/wines")
}
