import authConfig from "@/auth.config";
import NextAuth from "next-auth";

import { getUserById } from "@/lib/user";

// Типы Session/JWT с полем role — в types/next-auth.d.ts

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  // basePath Auth.js остаётся дефолтным "/api/auth": Next срезает /admin до route handler.
  // Клиенту публичный путь /admin/api/auth передаётся через SessionProvider в app/layout.tsx.
  // Редиректы Auth.js basePath из next.config не учитывают, поэтому /admin указан явно.
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.email) session.user.email = token.email;
        if (token.role) session.user.role = token.role;
        session.user.name = token.name;
      }

      return session;
    },

    // Данные пользователя перечитываются из БД на каждый запрос:
    // смена роли применяется сразу, а удалённый пользователь теряет сессию.
    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);
      if (!dbUser) return null;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.role = dbUser.role;

      return token;
    },
  },
  ...authConfig,
});
