import { createTRPCNext } from "@trpc/next";
import { ssrPrepass } from "@trpc/next/ssrPrepass";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/trpc";
import SuperJSON from "superjson";

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: SuperJSON,
        }),
      ],
    };
  },
  ssrPrepass,
  ssr: true,
  transformer: SuperJSON,
});

