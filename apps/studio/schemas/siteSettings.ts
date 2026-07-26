/**
 * Maison — Sanity schema: Site settings
 */

import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "announcementBarText",
      title: "Announcement Bar Text",
      type: "string",
    }),
    defineField({
      name: "announcementBarActive",
      title: "Announcement Bar Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featuredCollectionSlug",
      title: "Featured Collection Slug",
      type: "string",
      description: "Slug of the collection to feature on the homepage (e.g. 'lighting')",
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram Handle",
      type: "string",
      initialValue: "maisonliving",
    }),
  ],
});
