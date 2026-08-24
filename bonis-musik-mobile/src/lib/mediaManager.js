import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
export const SUPABASE_URL = 'https://oncpyjqbfkfkjqisdzli.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration Cloudinary (depuis vos Product Environment Credentials)
export const CLOUDINARY_CONFIG = {
  cloudName: 'jrj6vk7k',
  apiKey: '363618681598582',
  apiSecret: 'aPclr4Cgcpwj6psLgucEce_wQxk',
  uploadPreset: 'bonis_musik', // ou upload direct
};

/**
 * Helper unifié de résolution de média :
 * Gère automatiquement la combinaison des 3 formats :
 * 1. Base64 (data:image/..., data:audio/...)
 * 2. Cloudinary (URLs de streaming vidéo / audio / images optimisées)
 * 3. Supabase Storage (Buckets publics/privés)
 */
export const resolveMediaUrl = (urlOrPath, bucket = 'gallery') => {
  if (!urlOrPath) return null;

  // Cas 1 : Format Base64 ou URL HTTP directe (Cloudinary, CDN, Web)
  if (urlOrPath.startsWith('data:') || urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // Cas 2 : Référence Cloudinary directe par public_id
  if (urlOrPath.startsWith('cloudinary:')) {
    const publicId = urlOrPath.replace('cloudinary:', '');
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;
  }

  // Cas 3 : Supabase Storage Bucket
  const { data } = supabase.storage.from(bucket).getPublicUrl(urlOrPath);
  return data?.publicUrl || urlOrPath;
};
