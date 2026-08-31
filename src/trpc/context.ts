import { auth } from "~/auth";

/**
 * Resolves the session once for all procedures in an incoming tRPC request.
 *
 * @returns The request's NextAuth session, when authenticated.
 */
export async function createTRPCContext() {
  const session = await auth();
  return { session };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
