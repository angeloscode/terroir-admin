import "server-only"

import { prisma } from "@/lib/db"

export const ANALYTICS_TZ = "Europe/Moscow"
const DAYS = 14

/** Дата YYYY-MM-DD в часовом поясе аналитики */
export function analyticsDay(date = new Date()) {
  return date.toLocaleDateString("sv-SE", { timeZone: ANALYTICS_TZ })
}

export type DailyStat = { day: string; views: number; visitors: number }

/** Просмотры и уникальные посетители по дням за последние 14 дней, включая пустые дни */
export async function getDailyStats(): Promise<DailyStat[]> {
  const rows = await prisma.$queryRaw<{ day: Date; views: number; visitors: number }[]>`
    WITH days AS (
      SELECT generate_series(
        (now() AT TIME ZONE ${ANALYTICS_TZ})::date - ${DAYS - 1}::int,
        (now() AT TIME ZONE ${ANALYTICS_TZ})::date,
        interval '1 day'
      )::date AS day
    ),
    recent AS (
      SELECT ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${ANALYTICS_TZ})::date AS day, visitor_id
      FROM page_views
      WHERE created_at >= (now() AT TIME ZONE 'UTC') - interval '15 days'
    )
    SELECT d.day, COUNT(r.visitor_id)::int AS views, COUNT(DISTINCT r.visitor_id)::int AS visitors
    FROM days d
    LEFT JOIN recent r ON r.day = d.day
    GROUP BY d.day
    ORDER BY d.day
  `

  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    views: r.views,
    visitors: r.visitors,
  }))
}

/** Изменение в процентах; null, если сравнивать не с чем */
export function change(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}
