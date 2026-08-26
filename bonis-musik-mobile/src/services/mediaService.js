import { supabase, resolveMediaUrl, CLOUDINARY_CONFIG } from '../lib/mediaManager';
import { SAMPLE_DATA } from '../data/sampleData';

export const MediaService = {
  /**
   * Récupère les albums réels depuis Supabase avec toutes leurs chansons et clips associés
   */
  async getAlbums() {
    try {
      const { data: albumsData, error } = await supabase
        .from('albums')
        .select('*, songs(*)')
        .order('created_at', { ascending: false });

      // Récupérer également les clips vidéos associés aux albums
      const { data: clipsData } = await supabase
        .from('media_contents')
        .select('*')
        .eq('category', 'video_clip')
        .order('created_at', { ascending: false });

      if (error || !albumsData || albumsData.length === 0) {
        return SAMPLE_DATA.audioReleases;
      }

      return albumsData.map((album) => {
        // Associer les clips de cet album (soit par album_id, soit clips généraux)
        const matchedClips = (clipsData || []).filter(c => c.album_id === album.id);
        const albumClips = matchedClips.length > 0 ? matchedClips.map(c => ({
          id: c.id,
          title: c.title,
          duration: c.duration || '04:30',
          thumbnail: resolveMediaUrl(c.thumbnail_url, 'covers') || resolveMediaUrl(album.cover_url, 'covers'),
          videoUrl: resolveMediaUrl(c.media_url, 'media'),
          views: `${c.views_count || 0} vues`,
          type: 'video',
          artist: c.speaker_or_artist || album.artist_name || 'Chantre Boniface',
        })) : [];

        return {
          id: album.id,
          title: album.title,
          year: album.release_date ? new Date(album.release_date).getFullYear().toString() : '2026',
          cover: resolveMediaUrl(album.cover_url, 'covers'),
          artist: album.artist_name || 'Chantre Boniface',
          tracks: (album.songs || []).map((song) => ({
            id: song.id,
            title: song.title,
            duration: song.duration || '04:00',
            // Résolution prioritaire de l'URL audio réelle Supabase / Cloudinary
            url: resolveMediaUrl(song.audio_url || song.file_url || song.url, 'media'),
            liked: false,
          })),
          clips: albumClips,
        };
      });
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
      let query = supabase.from('media_contents').select('*').order('created_at', { ascending: false });
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
        thumbnail: resolveMediaUrl(item.thumbnail_url, 'covers'),
        videoUrl: resolveMediaUrl(item.media_url, 'media'),
        url: resolveMediaUrl(item.media_url, 'media'),
        type: item.category === 'teaching_audio' ? 'audio' : 'video',
        date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        views: `${item.views_count || 0} vues`,
        artist: item.speaker_or_artist || 'Chantre Boniface',
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
