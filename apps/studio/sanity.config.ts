/**
 * Maison — Sanity Studio configuration
 *
 * Run dev: pnpm --filter=@maison/studio dev
 * Deploy:  pnpm --filter=@maison/studio build (then `sanity deploy`)
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

const projectId = process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? 'your-project-id';
const dataset = process.env['NEXT_PUBLIC_SANITY_DATASET'] ?? 'production';

export default defineConfig({
  name: 'maison-studio',
  title: 'Maison Studio',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
