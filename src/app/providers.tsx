"use client";

import { SessionProvider } from "next-auth/react";
import SessionRedirect from "./session";
import { TrpcProvider } from "@/lib/trpcProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><SessionRedirect /><TrpcProvider>{children}</TrpcProvider></SessionProvider>;
}
