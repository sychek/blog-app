import { t } from "@/server/trpc-base";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { Gender } from "@/generated/prisma/client";

export const profileRouter = t.router({
  getProfile: t.procedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        address: true,
        website: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),
  updateUserDetails: t.procedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        age: z.coerce.number().int().positive().optional(),
        gender: z.nativeEnum(Gender).optional(),
        address: z.string().optional(),
        website: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.email) {
        throw new Error("Not authenticated");
      }

      const updatedUser = await prisma.user.update({
        where: { email: ctx.session.user.email },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          age: input.age,
          gender: input.gender,
          address: input.address,
          website: input.website,
        },
      });

      return updatedUser;
    }),

  updatePassword: t.procedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.email) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { email: ctx.session.user.email },
      });

      if (!user) throw new Error("User not found");

      const passwordMatch = await bcrypt.compare(input.currentPassword, user.password);
      if (!passwordMatch) throw new Error("Current password is incorrect");

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      await prisma.user.update({
        where: { email: ctx.session.user.email },
        data: { password: hashedPassword },
      });

      return { message: "Password updated successfully" };
    }),
});

