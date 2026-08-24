import { supabase, resolveMediaUrl, CLOUDINARY_CONFIG } from '../lib/mediaManager';
import { SAMPLE_DATA } from '../data/sampleData';

export const MediaService = {
  /**
   * Récupère les albums et titres depuis Supabase avec fallback
   */
  async getAlbums() {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*, songs(*)');

      if (error || !data || data.length === 0) {
        return SAMPLE_DATA.audioReleases;
      }

      return data.map((album) => ({
        id: album.id,
        title: album.title,
        year: album.release_date ? new Date(album.release_date).getFullYear().toString() : '2026',
        cover: resolveMediaUrl(album.cover_url, 'gallery'),
        artist: album.artist_name || 'Chantre Boniface',
        tracks: (album.songs || []).map((song) => ({
          id: song.id,
          title: song.title,
          duration: song.duration || '04:00',
          url: resolveMediaUrl(song.file_url, 'gallery'),
          liked: false,
        })),
      }));
    } catch (err) {
      console.warn('Fallback sample albums:', err);
      return SAMPLE_DATA.audioReleases;
    }
  },

  /**
   * Récupère les clips vidéo et enseignements
   */
  async getMediaContents(category = null) {
    try {
      let query = supabase.from('media_contents').select('*');
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        if (category === 'video_clip') return SAMPLE_DATA.videoClips;
        return SAMPLE_DATA.teachings;
      }

      return data.map((item) => ({
        id: item.id,
        title: item.title,
        duration: item.duration || '05:00',
        thumbnail: resolveMediaUrl(item.thumbnail_url, 'gallery'),
        videoUrl: resolveMediaUrl(item.media_url, 'gallery'),
        type: item.category === 'teaching_audio' ? 'audio' : 'video',
        date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        views: `${item.views_count || 0} vues`,
      }));
    } catch (err) {
      console.warn('Fallback sample media:', err);
      return category === 'video_clip' ? SAMPLE_DATA.videoClips : SAMPLE_DATA.teachings;
    }
  },

  /**
   * Upload un média vers Cloudinary (Supporte Base64 & Fichiers locaux)
   */
  async uploadToCloudinary(fileBase64OrUri, resourceType = 'image') {
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
    
    const formData = new FormData();
    formData.append('file', fileBase64OrUri);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result.secure_url;
  },

  /**
   * Upload vers Supabase Storage
   */
  async uploadToSupabaseStorage(bucketName, filePath, fileBody) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBody, { upsert: true });

    if (error) throw error;
    return resolveMediaUrl(data.path, bucketName);
  }
};
