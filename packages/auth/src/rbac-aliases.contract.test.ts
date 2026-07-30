/**
 * Maison — RBAC deprecated aliases removal contract test (H6, ADR-008)
 *
 * Locks the invariant that the deprecated RBAC aliases (canReadAdmin,
 * canWriteAdmin, ADMIN_ROLES, ADMIN_WRITE_ROLES) are NOT exported from
 * @maison/auth. Per ADR-008 + Skill 1 (Stillwater reference) — the
 * canonical helpers are canAccessStaff / canAccessOwner / STAFF_ROLES /
 * OWNER_ROLES.
 *
 * Background:
 *   The v4 plan removed adminProcedure/adminWriteProcedure from tRPC.
 *   The v7 plan (Task 1.6) removes the parallel RBAC aliases that were
 *   kept for backward compat. See docs/REMEDIATION_PLAN_v7.md Task 1.6.
 */

import { describe, it, expect } from 'vitest';

describe('H6 — RBAC deprecated aliases removed (ADR-008)', () => {
  it('rbac.ts does NOT export canReadAdmin', async () => {
    const rbac = await import('./rbac');
    expect(rbac).not.toHaveProperty('canReadAdmin');
  });

  it('rbac.ts does NOT export canWriteAdmin', async () => {
    const rbac = await import('./rbac');
    expect(rbac).not.toHaveProperty('canWriteAdmin');
  });

  it('rbac.ts does NOT export ADMIN_ROLES', async () => {
    const rbac = await import('./rbac');
    expect(rbac).not.toHaveProperty('ADMIN_ROLES');
  });

  it('rbac.ts does NOT export ADMIN_WRITE_ROLES', async () => {
    const rbac = await import('./rbac');
    expect(rbac).not.toHaveProperty('ADMIN_WRITE_ROLES');
  });

  it('package entrypoint does NOT re-export deprecated RBAC aliases', async () => {
    const auth = await import('./index');
    expect(auth).not.toHaveProperty('canReadAdmin');
    expect(auth).not.toHaveProperty('canWriteAdmin');
    expect(auth).not.toHaveProperty('ADMIN_ROLES');
    expect(auth).not.toHaveProperty('ADMIN_WRITE_ROLES');
  });

  it('canonical RBAC helpers ARE still exported', async () => {
    const auth = await import('./index');
    expect(auth).toHaveProperty('canAccessStaff');
    expect(auth).toHaveProperty('canAccessOwner');
    expect(auth).toHaveProperty('STAFF_ROLES');
    expect(auth).toHaveProperty('OWNER_ROLES');
  });
});
