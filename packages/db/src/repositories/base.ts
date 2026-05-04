import type { SigmafyDb } from "../client";

/**
 * Base class for workspace-scoped repositories.
 *
 * Concrete repositories receive a `SigmafyDb` instance that was already bound
 * to a workspace via `withWorkspace()`. By construction, every query they run
 * is filtered by the active workspace's RLS policy.
 */
export abstract class WorkspaceScopedRepository {
  protected constructor(protected readonly db: SigmafyDb) {}
}
