# Terroir Admin

Админ-панель на Next.js. Работает на том же домене, что и сайт, по пути `/admin` (`basePath`).

Запуск, архитектура и принятые решения описаны в [README в корне](../README.md).

```bash
npm ci
npm run db:migrate                                        # миграции Prisma
npm run admin:create -- admin@example.com 'admin12345'    # администратор
npm run dev                                               # http://localhost:3000/admin
```
