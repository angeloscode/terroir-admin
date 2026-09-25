import type { ReactNode } from "react";

import { Command } from "lucide-react";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";

import loginCover from "@/public/images/login-cover.jpg";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full overflow-hidden rounded-3xl bg-primary lg:flex">
          <Image
            src={loginCover}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="50vw"
            className="object-cover"
          />
          {/* картинка светлая: затемняем верх и низ, чтобы белый текст читался */}
          <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/10 to-black/65" />

          <div className="absolute top-10 space-y-1 px-10 text-white">
            <Command className="size-10" />
            <h1 className="font-medium text-2xl">{siteConfig.name}</h1>
            <p className="text-sm text-white/80">Панель администратора</p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="flex-1 space-y-1 text-white">
              <h2 className="font-medium">Всё в одном месте</h2>
              <p className="text-sm text-white/80">
                Управляйте контентом сайта, заказами и аналитикой из единой панели.
              </p>
            </div>
            <Separator orientation="vertical" className="mx-3 h-auto! bg-white/30" />
            <div className="flex-1 space-y-1 text-white">
              <h2 className="font-medium">Нужен доступ?</h2>
              <p className="text-sm text-white/80">
                Учётные записи выдаёт администратор. Обратитесь к нему, если не можете войти.
              </p>
            </div>
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
