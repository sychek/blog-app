import { prisma } from "@/lib/prisma";
import { commentRouter } from "@/server/routers/comment";

jest.mock("@/lib/prisma", () => ({
  prisma: require("@mocks/prisma").prisma,
}));

describe("commentRouter", () => {
  const ctx = {
    req: {
      headers: new Map([["x-forwarded-host", "http://localhost:3000"]]),
      get: (key: string) => {
        if (key === "x-forwarded-host") return "http://localhost:3000";
        return null;
      }
    },
    session: {
      user: {
        id: "user-1",
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("successfully creates a new comment", async () => {
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: "comment-1",
        body: "test comment",
        name: "test name",
        authorId: "user-1",
        postId: "post-1",
      });

      const caller = commentRouter.createCaller(ctx as any);

      const res = await caller.createComment({
          postId: "post-1",
          body: "test comment",
          name: "test name"
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          body: "test comment",
          name: "test name",
          authorId: "user-1",
          postId: "post-1",
        },
      });
      expect(res).toEqual({
        id: "comment-1",
        body: "test comment",
        name: "test name",
        authorId: "user-1",
        postId: "post-1",
      });
    });
  });
});
