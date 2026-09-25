import { prisma } from "@/lib/db";

export const getUserById = async (id: string) => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
};
