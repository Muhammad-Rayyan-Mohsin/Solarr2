-- Storage policies for the surveys bucket
-- Run this after creating the private bucket 'surveys' in Supabase Dashboard

-- Storage policies for the 'surveys' bucket
-- These policies ensure users can only access their own survey assets

-- Allow authenticated users to read their own objects
create policy "surveys_storage_read_own"
on storage.objects for select to authenticated
using (bucket_id = 'surveys' and owner = auth.uid());

-- Allow authenticated users to upload their own objects
create policy "surveys_storage_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'surveys' and owner = auth.uid());

-- Allow authenticated users to update their own objects
create policy "surveys_storage_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'surveys' and owner = auth.uid())
with check (bucket_id = 'surveys' and owner = auth.uid());

-- Allow authenticated users to delete their own objects
create policy "surveys_storage_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'surveys' and owner = auth.uid());

-- Public staging bucket for pre-auth uploads
-- Create a public bucket named 'staging-uploads' in the Dashboard first

-- Allow anonymous insert (uploads) into staging bucket
create policy "staging_uploads_insert_anon"
on storage.objects for insert to anon
with check (bucket_id = 'staging-uploads');

-- Allow anonymous read from staging bucket (optional: keep for preview)
create policy "staging_uploads_select_anon"
on storage.objects for select to anon
using (bucket_id = 'staging-uploads');

-- Restrict updates/deletes in staging to authenticated users only (optional hardening)
create policy "staging_uploads_update_auth"
on storage.objects for update to authenticated
using (bucket_id = 'staging-uploads')
with check (bucket_id = 'staging-uploads');

create policy "staging_uploads_delete_auth"
on storage.objects for delete to authenticated
using (bucket_id = 'staging-uploads');