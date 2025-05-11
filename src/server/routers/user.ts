import { t } from "@/server/trpc-base";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";

export const userRouter = t.router({
  register: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(4),
        username: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { username, email, password } = input;

      if (!email || !password || !username) {
        throw new Error("Missing required fields");
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });

      return {
        message: "User registered",
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }),
  forgotPassword: t.procedure
    .input(z.object({
      email: z.string().email()
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error("No account with that email address exists.");
      }

      const token = randomBytes(32).toString("hex");
      const expires = addHours(new Date(), 1);

      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: expires,
        },
      });

      const baseUrl = ctx.req.headers.get("x-forwarded-host");
      const resetUrl = `${baseUrl}/login/reset-password?token=${token}`;
      console.log(`🔗 Password reset link (would be emailed): ${resetUrl}`);

      return true;
    }),
  resetPassword: t.procedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(4),
    }))
    .mutation(async ({ input }) => {
      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token: input.token },
      });

      if (!resetRecord || resetRecord.expiresAt < new Date()) {
        throw new Error("Invalid or expired token.");
      }

      const hashedPassword = await hash(input.newPassword, 10);

      await prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({ where: { token: input.token } });

      return { success: true };
    }),
});

