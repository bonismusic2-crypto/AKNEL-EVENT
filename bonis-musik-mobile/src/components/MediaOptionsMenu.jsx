import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import {
  Download,
  Heart,
  ListPlus,
  Info,
  CheckCircle,
  X,
  Play,
  Film,
  Music,
  Trash2
} from 'lucide-react-native';
import { THEME } from '../constants/theme';

export const MediaOptionsMenu = ({
  visible,
  onClose,
  item,
  isDownloaded = false,
  isFavorite = false,
  onToggleDownload,
  onToggleFavorite,
  onPlayDirect,
}) => {
  if (!item) return null;

  const isVideo = item.type === 'video' || item.category === 'video_clip' || item.category === 'teaching_video';
  const title = item.title || 'Contenu';
  const subtitle = item.artist || item.speaker_or_artist || 'Chantre Boniface';
  const coverUrl = item.thumbnail || item.thumbnail_url || item.cover || item.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header avec Miniature & Titre */}
              <View style={styles.header}>
                <Image source={{ uri: coverUrl }} style={styles.thumbnail} />
                <View style={styles.headerInfo}>
                  <Text style={styles.title} numberOfLines={2}>{title}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={20} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Actions du Menu */}
              <View style={styles.optionsList}>
                {/* 1. Écouter / Regarder */}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    if (onPlayDirect) onPlayDirect(item);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(197, 155, 39, 0.12)' }]}>
                    <Play size={18} color={THEME.colors.gold} fill={THEME.colors.gold} />
                  </View>
                  <Text style={styles.optionText}>{isVideo ? 'Regarder la vidéo' : 'Lancer la lecture'}</Text>
                </TouchableOpacity>

                {/* 2. Télécharger pour écoute/visionnage hors-ligne */}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    if (onToggleDownload) onToggleDownload(item);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, isDownloaded ? { backgroundColor: '#DCFCE7' } : { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                    {isDownloaded ? (
                      <CheckCircle size={18} color="#166534" />
                    ) : (
                      <Download size={18} color="#2563EB" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.optionText}>
                      {isDownloaded ? 'Supprimer des téléchargements' : 'Télécharger pour hors-ligne'}
                    </Text>
                    <Text style={styles.optionSubtext}>
                      {isDownloaded ? 'Disponible sans connexion Internet' : 'Lecture in-app chiffrée et sécurisée'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Ajouter / Retirer des favoris */}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    if (onToggleFavorite) onToggleFavorite(item);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, isFavorite ? { backgroundColor: '#FEE2E2' } : { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Heart size={18} color="#DC2626" fill={isFavorite ? '#DC2626' : 'transparent'} />
                  </View>
                  <Text style={styles.optionText}>{isFavorite ? 'Retirer des favoris' : 'Ajouter à mes favoris'}</Text>
                </TouchableOpacity>

                {/* 4. Détails & Crédits */}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    Alert.alert(
                      title,
                      `Interprète : ${subtitle}\nType : ${isVideo ? 'Vidéo HD' : 'Audio HD'}\nProtection : Droits réservés Chantre Boniface / AKNEL Event.`
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                    <Info size={18} color={THEME.colors.textSecondary} />
                  </View>
                  <Text style={styles.optionText}>Détails & Informations</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  optionSubtext: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
