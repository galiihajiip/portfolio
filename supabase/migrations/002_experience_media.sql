-- Add media_urls column to experience table for certificates/documentation
alter table public.experience add column if not exists media_urls text[] default '{}';
