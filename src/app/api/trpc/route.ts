import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const session = await getServerSession(authOptions);
      return { session };
    },
  });

export { handler as GET, handler as POST };

