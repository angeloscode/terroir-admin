#!/usr/bin/env node
// Создать администратора или обновить его пароль/имя.
//   локально:  npm run admin:create -- admin@example.com 'StrongPassword' 'Имя'
//   в Docker:  docker compose exec app create-admin admin@example.com 'StrongPassword' 'Имя'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
  console.error("Использование: create-admin <email> <пароль> [имя]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Пароль должен быть не короче 8 символов");
  process.exit(1);
}

const prisma = new PrismaClient();
const hash = await bcrypt.hash(password, 10);
const normalized = email.toLowerCase();

try {
  await prisma.user.upsert({
    where: { email: normalized },
    update: { password: hash, role: "ADMIN", ...(name && { name }) },
    create: { email: normalized, name: name ?? "Администратор", password: hash, role: "ADMIN" },
  });
  console.log(`Администратор готов: ${normalized}`);
} finally {
  await prisma.$disconnect();
}
