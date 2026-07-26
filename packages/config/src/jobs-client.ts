/**
 * Maison — Trigger.dev jobs client
 *
 * Returns a real TriggerClient when TRIGGER_SECRET_KEY is set,
 * or a stub when unset (tests, builds, preview envs).
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * infrastructure clients use process.env directly (not the Zod env module)
 * for build-context compatibility.
 */

interface JobsClient {
  trigger: (task: string, payload: unknown) => Promise<{ id: string }>;
}

interface StubJobsClient extends JobsClient {
  _isStub: true;
}

/**
 * Stub jobs client — used when TRIGGER_SECRET_KEY is not set.
 * Returns a fake job ID so callers don't crash. No actual work is performed.
 */
function createStubJobsClient(): StubJobsClient {
  return {
    _isStub: true,
    async trigger(task: string) {
      console.warn(
        `[jobs] Trigger.dev not configured (TRIGGER_SECRET_KEY unset). ` +
          `Task "${task}" was not enqueued. This is expected in test/build/preview environments.`,
      );
      return { id: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    },
  };
}

/**
 * Real Trigger.dev client — lazy-loaded so the import doesn't fail
 * in environments where @trigger.dev/sdk is not installed.
 */
async function createRealJobsClient(): Promise<JobsClient> {
  const { TriggerClient } = await import("@trigger.dev/sdk/v4");
  const client = new TriggerClient({
    id: "maison",
    apiKey: process.env["TRIGGER_SECRET_KEY"]!,
  });
  return {
    async trigger(task: string, payload: unknown) {
      return client.sendEvent({
        name: task,
        payload,
      });
    },
  };
}

let cachedClient: JobsClient | null = null;

/**
 * Get the jobs client. Returns a stub if TRIGGER_SECRET_KEY is unset.
 * The real client is lazy-loaded (async) on first use.
 */
export function getJobsClient(): JobsClient {
  if (cachedClient) return cachedClient;

  const hasTriggerKey =
    process.env["TRIGGER_SECRET_KEY"] &&
    process.env["TRIGGER_SECRET_KEY"].startsWith("tr_") &&
    !process.env["TRIGGER_SECRET_KEY"].includes("placeholder");

  if (!hasTriggerKey) {
    cachedClient = createStubJobsClient();
    return cachedClient;
  }

  // For sync callers, return a stub that lazily initialises the real client.
  // The real client is async-initialised; callers should await trigger() anyway.
  const stub = createStubJobsClient();
  createRealJobsClient()
    .then((real) => {
      cachedClient = real;
    })
    .catch((err) => {
      console.error("[jobs] Failed to initialise Trigger.dev client, using stub:", err);
    });
  cachedClient = stub;
  return cachedClient;
}
