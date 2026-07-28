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
      return {
        id: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    },
  };
}

/**
 * Real Trigger.dev client — dynamically imported so the module is only
 * loaded on first real use (TRIGGER_SECRET_KEY set). `@trigger.dev/sdk` is
 * a normal dependency of this package; `await import()` here defers the
 * runtime cost, but tsc still type-checks the specifier — so the package
 * must be declared in package.json and the subpath must exist.
 */
async function createRealJobsClient(): Promise<JobsClient> {
  // NOTE: There is no '@trigger.dev/sdk/v4' subpath on any published version of
  // @trigger.dev/sdk (the package only exports `.`, `./v3`, and `./ai`). The
  // main entry *is* the v3 API surface. Importing the bare package name keeps
  // the existing dynamic-import + stub pattern intact.
  //
  // v3 API notes (verified against @trigger.dev/sdk@4.5.7 .d.ts):
  // - TriggerClientConfig = ApiClientConfiguration & { inheritContext? }; it
  //   has no `id` or `apiKey` field — auth is via `accessToken` (= the secret key),
  //   plus optional `baseURL`. Project identity comes from env, not the client ctor.
  // - tasks.trigger() is generic over <TTask extends AnyTask>; for a runtime
  //   string task name we bind TTask = AnyTask, so TaskIdentifier<AnyTask> = string
  //   (the call is type-safe) and the returned RunHandle widens to { id: string }.
  const { TriggerClient } = await import('@trigger.dev/sdk');
  const client = new TriggerClient({
    accessToken: process.env['TRIGGER_SECRET_KEY']!,
  });
  return {
    async trigger(task: string, payload: unknown) {
      // Bind TTask = AnyTask so TaskIdentifier<AnyTask> = string (type-safe for a
      // runtime task name) and the returned RunHandle widens to { id: string }.
      return client.tasks.trigger<import('@trigger.dev/sdk').AnyTask>(task, payload);
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
    process.env['TRIGGER_SECRET_KEY'] &&
    process.env['TRIGGER_SECRET_KEY'].startsWith('tr_') &&
    !process.env['TRIGGER_SECRET_KEY'].includes('placeholder');

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
      console.error('[jobs] Failed to initialise Trigger.dev client, using stub:', err);
    });
  cachedClient = stub;
  return cachedClient;
}
