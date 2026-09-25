import { Grape, LayoutDashboard } from "lucide-react"

export const navItems = [
  { title: "Обзор", url: "/", icon: LayoutDashboard },
  { title: "Вина", url: "/wines", icon: Grape },
]

// Пункт активен на своей странице и на вложенных (/wines/new, /wines/[id])
export const isActivePath = (pathname: string, url: string) =>
  url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/")
