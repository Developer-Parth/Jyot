import { createClient } from '@supabase/supabase-js';

function deriveSupabaseUrl(): string | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  const match = dbUrl.match(/postgres\.([^.]+)\.pooler\.supabase\.com/);
  if (!match) return null;
  return `https://${match[1]}.supabase.co`;
}

const supabaseUrl = process.env.SUPABASE_URL || deriveSupabaseUrl() || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = serviceKey && supabaseUrl
  ? createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export const BUCKET_NAME = 'wish-videos';

export async function ensureBucket() {
  if (!supabaseAdmin) return false;
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (buckets?.find(b => b.name === BUCKET_NAME)) return true;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
    public: false,
    fileSizeLimit: 52428800, // 50 MB
    allowedMimeTypes: ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-matroska', 'image/jpeg', 'image/png', 'image/webp'],
  });
  return !error;
}

export function isStorageConfigured(): boolean {
  return !!supabaseAdmin;
}
