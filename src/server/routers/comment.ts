import { t } from "@/server/trpc-base";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const commentRouter = t.router({
  createComment: t.procedure
    .input(
      z.object({
        postId: z.string(),
        body: z.string().min(1, "Comment cannot be empty"),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, body, name } = input;

      if (!ctx.session?.user || !name) {
        throw new Error("User not authenticated or name not specified");
      }

      const comment = await prisma.comment.create({
        data: {
          body,
          postId,
          authorId: ctx.session.user.id,
          name,
        },
      });

      return comment;
    }),

  getCommentsByPostId: t.procedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId } }) => {
      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
      });

      return comments;
    }),
  deleteComment: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id } }) => {
      if (!id) {
        throw new Error("Comment ID is required");
      }

      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.authorId !== comment.authorId) {
        throw new Error("You are not authorized to delete this comment");
      }

      await prisma.comment.delete({ where: { id } });
    })
});

