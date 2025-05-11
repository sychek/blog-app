import { t } from "@/server/trpc-base";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const postRouter = t.router({
  getPaginatedPosts: t.procedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input: { page, limit } }) => {
      const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { name: true } },
          },
        }),
        prisma.post.count(),
      ]);

      return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),
  getPostById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id } }) => {
      const post = await prisma.post.findUnique({ where: { id } });
      return post;
    }),
  createPost: t.procedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Not authenticated");

      const post = await prisma.post.create({
        data: {
          title: input.title,
          description: input.description,
          body: input.body,
          authorId: ctx.session.user.id,
        },
      });

      return post;
    }),
  updatePost: t.procedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Not authenticated");

      const post = await prisma.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          body: input.body,
        },
      });

      return post;
    }),
});

