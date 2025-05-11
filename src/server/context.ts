import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const createContext = async (opts: { req: Request }) => {
  const session = await getServerSession(authOptions);
  return { req: opts.req, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

