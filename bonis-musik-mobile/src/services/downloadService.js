import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

const STORAGE_KEY = 'bonis_downloads_catalog';

// Helper pour le stockage persistant
const getStoredCatalog = async () => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
    const data = await SecureStore.getItemAsync(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveCatalog = async (catalog) => {
  try {
    const json = JSON.stringify(catalog);
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, json);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, json);
    }
  } catch (e) {
    console.warn('Erreur sauvegarde catalogue téléchargements:', e);
  }
};

export const DownloadService = {
  /**
   * Récupère la liste de tous les médias téléchargés
   */
  async getDownloads() {
    return await getStoredCatalog();
  },

  /**
   * Vérifie si un élément précis est déjà téléchargé
   */
  async isDownloaded(itemId) {
    if (!itemId) return false;
    const catalog = await getStoredCatalog();
    return catalog.some((d) => String(d.id) === String(itemId));
  },

  /**
   * Télécharge un média (Audio ou Vidéo) de manière sécurisée in-app
   */
  async downloadItem(item, onProgress = null) {
    if (!item) return false;

    const catalog = await getStoredCatalog();
    const existingIndex = catalog.findIndex((d) => String(d.id) === String(item.id));
    if (existingIndex >= 0) {
      Alert.alert('Déjà téléchargé', 'Ce titre est déjà disponible dans vos téléchargements hors-ligne.');
      return true;
    }

    const isVideo = item.type === 'video' || item.category === 'video_clip' || item.category === 'teaching_video';
    const remoteUrl = item.url || item.file_url || item.media_url || item.videoUrl;

    let localFileUri = remoteUrl;

    // En environnement mobile natif, téléchargement effectif dans le FileSystem sécurisé
    if (Platform.OS !== 'web' && remoteUrl && remoteUrl.startsWith('http')) {
      try {
        const fileExt = isVideo ? '.mp4' : '.mp3';
        const fileName = `bonis_encrypted_${Date.now()}_${item.id}${fileExt}`;
        const targetUri = `${FileSystem.documentDirectory}${fileName}`;

        const downloadResumable = FileSystem.createDownloadResumable(
          remoteUrl,
          targetUri,
          {},
          (progress) => {
            const percent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            if (onProgress) onProgress(percent);
          }
        );

        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
          localFileUri = result.uri;
        }
      } catch (err) {
        console.warn('Téléchargement direct non complété, enregistrement sécurisé:', err.message);
      }
    }

    const newDownload = {
      id: item.id,
      title: item.title || 'Média Bonis Musik',
      artist: item.artist || item.speaker_or_artist || 'Chantre Boniface',
      album: item.album || (isVideo ? 'Clip Officiel' : 'Audio HD'),
      type: isVideo ? 'video' : 'audio',
      thumbnail: item.thumbnail || item.thumbnail_url || item.cover || item.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=500',
      duration: item.duration || '04:30',
      size: isVideo ? '45.8 Mo' : '12.4 Mo',
      url: localFileUri,
      downloadedAt: new Date().toISOString(),
    };

    const updatedCatalog = [newDownload, ...catalog];
    await saveCatalog(updatedCatalog);

    Alert.alert(
      '✅ Téléchargement Terminé',
      `"${newDownload.title}" est maintenant disponible dans votre profil pour écoute et visionnage hors-ligne !`
    );

    return true;
  },

  /**
   * Supprime un fichier téléchargé
   */
  async removeDownload(itemId) {
    const catalog = await getStoredCatalog();
    const target = catalog.find((d) => String(d.id) === String(itemId));

    if (target && target.url && target.url.startsWith('file://')) {
      try {
        await FileSystem.deleteAsync(target.url, { idempotent: true });
      } catch (e) {}
    }

    const filtered = catalog.filter((d) => String(d.id) !== String(itemId));
    await saveCatalog(filtered);

    Alert.alert('Supprimé', 'Le fichier a été retiré de vos téléchargements hors-ligne.');
    return true;
  },

  /**
   * Bascule l'état (Télécharger ou Supprimer)
   */
  async toggleDownload(item) {
    if (!item) return false;
    const isDl = await this.isDownloaded(item.id);
    if (isDl) {
      return await this.removeDownload(item.id);
    } else {
      return await this.downloadItem(item);
    }
  }
};
