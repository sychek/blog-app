import { initTRPC } from "@trpc/server";
import { Context } from "@/server/context";
import SuperJSON from "superjson";

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

