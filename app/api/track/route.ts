import { createHash } from "node:crypto"

import { analyticsDay } from "@/lib/analytics"
import { prisma } from "@/lib/db"

// Маячок публичного сайта: navigator.sendBeacon("/admin/api/track", JSON.stringify({ path }))
// Всегда отвечаем 204 — сайту не важен результат, а сканерам нечего выяснять.

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|go-http/i
const MAX_PATH = 300

export async function POST(request: Request) {
  const noContent = new Response(null, { status: 204 })

  const userAgent = request.headers.get("user-agent") ?? ""
  if (!userAgent || BOT_RE.test(userAgent)) return noContent

  let path: unknown
  try {
    // sendBeacon шлёт строку как text/plain — парсим сами
    path = JSON.parse(await request.text())?.path
  } catch {
    return noContent
  }
  if (typeof path !== "string" || !path.startsWith("/") || path.length > MAX_PATH) {
    return noContent
  }

  // Caddy выставляет X-Forwarded-For сам и не доверяет клиентскому значению
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? ""
  // Дата в поясе аналитики: ID меняется в полночь по Москве, как и границы дней в отчётах
  const visitorId = createHash("sha256")
    .update(`${process.env.AUTH_SECRET}|${analyticsDay()}|${ip}|${userAgent}`)
    .digest("hex")
    .slice(0, 32)

  try {
    await prisma.pageView.create({ data: { path: path.split(/[?#]/)[0], visitorId } })
  } catch {
    // аналитика не должна ронять ответ
  }

  return noContent
}
