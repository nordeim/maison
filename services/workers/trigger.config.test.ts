/**
 * Maison — Trigger.dev config contract test (ADR-016)
 *
 * Asserts the config exposes the v4-required `machine` and `maxDuration` fields.
 * Per ADR-016: machine must be the string literal "micro" (not object form);
 * maxDuration must be 120 (CPU-seconds, not wall-clock).
 *
 * Reference: CLAUDE.md §Trigger.dev, AGENTS.md §Trigger.dev.
 */

import { describe, it, expect } from 'vitest';

import { config } from './trigger.config';

describe('Trigger.dev v4 config (ADR-016)', () => {
  it('exports a TriggerConfig object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('uses machine: "micro" (string literal, not object form)', () => {
    expect(config).toHaveProperty('machine');
    expect(config.machine).toBe('micro');
  });

  it('declares maxDuration: 120 (CPU-seconds)', () => {
    expect(config).toHaveProperty('maxDuration');
    expect(config.maxDuration).toBe(120);
  });

  it('project name is "maison"', () => {
    expect(config.project).toBe('maison');
  });

  it('dirs includes "src"', () => {
    expect(Array.isArray(config.dirs)).toBe(true);
    expect(config.dirs).toContain('src');
  });
});
