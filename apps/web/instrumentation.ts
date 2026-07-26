/**
 * Maison — Instrumentation (Sentry + PostHog init)
 *
 * Called by Next.js on server startup.
 * Per Sentry Next.js integration guide.
 */

export async function register() {
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env["NEXT_RUNTIME"] === "edge") {
    await import("./sentry.edge.config");
  }
}
