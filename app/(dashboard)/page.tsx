import type { Metadata } from "next"
import { TrendingDown, TrendingUp } from "lucide-react"

import { change, getDailyStats, type DailyStat } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Обзор — Terroir Admin",
}

const nf = new Intl.NumberFormat("ru-RU")

const sum = (rows: DailyStat[], key: "views" | "visitors") =>
  rows.reduce((acc, row) => acc + row[key], 0)

export default async function Page() {
  const stats = await getDailyStats()
  const today = stats.at(-1)!
  const yesterday = stats.at(-2)!
  const week = stats.slice(-7)
  const prevWeek = stats.slice(-14, -7)

  const cards = [
    { label: "Просмотры сегодня", value: today.views, prev: yesterday.views, period: "ко вчера" },
    { label: "Посетители сегодня", value: today.visitors, prev: yesterday.visitors, period: "ко вчера" },
    { label: "Просмотры за 7 дней", value: sum(week, "views"), prev: sum(prevWeek, "views"), period: "к прошлой неделе" },
    { label: "Посетители за 7 дней", value: sum(week, "visitors"), prev: sum(prevWeek, "visitors"), period: "к прошлой неделе" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <ViewsChart stats={stats} />
    </div>
  )
}

function StatCard({
  label,
  value,
  prev,
  period,
}: {
  label: string
  value: number
  prev: number
  period: string
}) {
  const delta = change(value, prev)
  const Icon = delta !== null && delta < 0 ? TrendingDown : TrendingUp

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {nf.format(value)}
        </CardTitle>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        {delta === null ? (
          "Нет данных для сравнения"
        ) : (
          <span className="flex items-center gap-1">
            <Icon
              className={cn(
                "size-4",
                delta > 0 && "text-emerald-600 dark:text-emerald-400",
                delta < 0 && "text-red-600 dark:text-red-400"
              )}
            />
            {delta > 0 ? "+" : ""}
            {delta}% {period}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}

const dayLabel = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("ru-RU", { timeZone: "UTC", ...options })

function ViewsChart({ stats }: { stats: DailyStat[] }) {
  const max = Math.max(1, ...stats.map((s) => s.views))
  const total = sum(stats, "views")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Просмотры за 14 дней</CardTitle>
        <CardDescription>
          Всего {nf.format(total)} · уникальный посетитель считается один раз в сутки
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Пока нет просмотров — данные появятся после первых визитов на сайт
          </p>
        ) : (
          <>
            <div className="flex h-32 items-end gap-1.5" aria-hidden>
              {stats.map((s) => (
                <div
                  key={s.day}
                  title={`${dayLabel(s.day, { day: "numeric", month: "long" })}: ${s.views} просм., ${s.visitors} посет.`}
                  className="flex-1 rounded-t-sm bg-primary/80 transition-colors hover:bg-primary"
                  style={{ height: `${Math.max(2, (s.views / max) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground" aria-hidden>
              <span>{dayLabel(stats[0].day, { day: "numeric", month: "short" })}</span>
              <span>сегодня</span>
            </div>
            <table className="sr-only">
              <caption>Просмотры и посетители по дням</caption>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.day}>
                    <th scope="row">{dayLabel(s.day, { day: "numeric", month: "long" })}</th>
                    <td>{s.views} просмотров</td>
                    <td>{s.visitors} посетителей</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
