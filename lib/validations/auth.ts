import * as z from "zod"

export const userAuthSchema = z.object({
  email: z.email("Введите корректный адрес электронной почты"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
})
