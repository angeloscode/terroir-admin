import { Suspense } from "react";

import { ArrowLeft, Globe } from "lucide-react";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: `Вход — ${siteConfig.name}`,
  description: "Вход в панель администратора",
};

export default function LoginPage() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-87.5">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Вход в аккаунт</h1>
          <p className="text-muted-foreground text-sm">Введите электронную почту и пароль, чтобы продолжить.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <div className="absolute top-5 flex w-full justify-start px-10">
        {/* обычный <a>: ведёт на Astro-сайт в корне домена, мимо basePath /admin */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- ссылка на Astro вне basePath */}
        <a
          href="/"
          className="flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          На сайт
        </a>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{siteConfig.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="size-4 text-muted-foreground" />
          RU
        </div>
      </div>
    </>
  );
}
