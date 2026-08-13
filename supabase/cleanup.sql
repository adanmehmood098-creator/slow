-- Wipes the whole public schema (from any previous app) and storage leftovers,
-- then schema.sql + seed.sql rebuild everything for Bloom & Blush.
-- ONLY run against a demo project — this destroys all data.

drop schema public cascade;
create schema public;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_own_insert" on storage.objects;