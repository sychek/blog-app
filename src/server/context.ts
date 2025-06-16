import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";

export const createContext = async (opts: { req: Request }) => {
  const session = await getServerSession(authOptions);
  return { req: opts.req, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

