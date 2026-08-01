/**
 * Maison — Sanity schema barrel
 *
 * Exports all Sanity content schemas.
 * Imported by sanity.config.ts.
 */

import { collection } from './collection';
import { journalArticle } from './journalArticle';
import { product } from './product';
import { siteSettings } from './siteSettings';

export const schemaTypes = [product, collection, journalArticle, siteSettings];
