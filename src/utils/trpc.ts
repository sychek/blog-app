import { createTRPCNext } from "@trpc/next";
import { AppRouter } from "@/server/trpc";
import superjson from "superjson";

export const trpc = createTRPCNext<AppRouter>({
        config() {
                return {
                        transformer: superjson,
                        links: [
                                {
                                        url: "/api/trpc",
                                },
                        ],
                };
        },
        ssr: true,
});

