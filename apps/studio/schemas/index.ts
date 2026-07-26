/**
 * Maison — Sanity schema barrel
 *
 * Exports all Sanity content schemas.
 * Imported by sanity.config.ts.
 */

import { product } from "./product";
import { collection } from "./collection";
import { journalArticle } from "./journalArticle";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [product, collection, journalArticle, siteSettings];
