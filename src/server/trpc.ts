import { t } from "@/server/trpc-base";
import { userRouter } from "./routers/user";
import { commentRouter } from "./routers/comment";
import { postRouter } from "./routers/post";
import { profileRouter } from "./routers/profile";


export const appRouter = t.router({
  user: userRouter,
  comment: commentRouter,
  post: postRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

