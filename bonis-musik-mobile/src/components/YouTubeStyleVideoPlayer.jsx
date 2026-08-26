import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  Alert
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
  ChevronDown,
  ThumbsUp,
  Download,
  CheckCircle,
  MoreVertical,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { MediaOptionsMenu } from './MediaOptionsMenu';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const YouTubeStyleVideoPlayer = ({
  video,
  visible,
  isFloating,
  onClose,
  onMinimize,
  onMaximize,
  isDownloaded = false,
  onToggleDownload,
  suggestedVideos = [],
  onSelectVideo,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(128);
  const [isMuted, setIsMuted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const videoRef = useRef(null);

  if (!visible || !video) return null;

  const videoUri = video.url || video.media_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const videoTitle = video.title || 'Clip Officiel';
  const speakerOrArtist = video.artist || video.speaker_or_artist || 'Chantre Boniface';
  const views = video.views || '15,4K vues';
  const date = video.date || 'Il y a 3 jours';

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  // =========================================================================
  // 1. MODE MINI-PLAYER FLOTTANT EN BAS DE L'ÉCRAN (PICTURE-IN-PICTURE YOUTUBE)
  // =========================================================================
  if (isFloating) {
    return (
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={styles.floatingTouchable}
          onPress={onMaximize}
          activeOpacity={0.9}
        >
          {/* Lecteur Vidéo Réduit */}
          <View style={styles.floatingVideoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.floatingVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isPlaying}
              isLooping
              isMuted={isMuted}
            />
          </View>

          {/* Titre & Auteur */}
          <View style={styles.floatingInfo}>
            <Text style={styles.floatingTitle} numberOfLines={1}>
              {videoTitle}
            </Text>
            <Text style={styles.floatingSubtitle} numberOfLines={1}>
              {speakerOrArtist}
            </Text>
          </View>

          {/* Contrôles Rapides */}
          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => setIsPlaying(!isPlaying)}
            activeOpacity={0.7}
          >
            {isPlaying ? (
              <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================================================================
  // 2. MODE PLEIN ÉCRAN TYPE YOUTUBE AVEC BARRE D'ACTIONS ET SUGGESTIONS
  // =========================================================================
  return (
    <View style={styles.fullScreenContainer}>
      {/* Zone Vidéo 16:9 Header */}
      <View style={styles.videoPlayerBox}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.mainVideo}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={(status) => setIsPlaying(status.isPlaying)}
        />

        {/* Bouton Réduire en Mini-Player (Flèche vers le bas) */}
        <TouchableOpacity
          style={styles.minimizeBtn}
          onPress={onMinimize}
          activeOpacity={0.8}
        >
          <ChevronDown size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bouton 3 Points Options en haut à droite */}
        <TouchableOpacity
          style={styles.topOptionsBtn}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <MoreVertical size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Contenu Déroulant sous la Vidéo */}
      <ScrollView
        style={styles.detailsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Titre & Métadonnées Vidéo */}
        <View style={styles.videoInfoSection}>
          <Text style={styles.mainTitle}>{videoTitle}</Text>
          <Text style={styles.viewsMeta}>
            {views} • {date} • <Text style={{ color: THEME.colors.gold, fontWeight: '700' }}>Qualité HD 4K</Text>
          </Text>

          {/* Profil Chaîne / Artiste */}
          <View style={styles.channelRow}>
            <Image
              source={require('../../assets/icon boni musik.png')}
              style={styles.channelAvatar}
            />
            <View style={styles.channelDetails}>
              <Text style={styles.channelName}>{speakerOrArtist}</Text>
              <Text style={styles.subscribersCount}>Ministère Officiel • Chantre de l'Éternel</Text>
            </View>
          </View>
        </View>

        {/* Barre d'Actions YouTube (J'aime, Télécharger, 3 Points) */}
        <View style={styles.actionsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsList}>
            {/* 1. Bouton J'aime */}
            <TouchableOpacity
              style={[styles.actionChip, isLiked && styles.actionChipActive]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <ThumbsUp
                size={16}
                color={isLiked ? '#FFFFFF' : THEME.colors.textPrimary}
                fill={isLiked ? '#FFFFFF' : 'transparent'}
              />
              <Text style={[styles.actionChipText, isLiked && styles.actionChipTextActive]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* 2. Bouton Télécharger pour Hors-ligne */}
            <TouchableOpacity
              style={[styles.actionChip, isDownloaded && styles.downloadChipActive]}
              onPress={() => onToggleDownload(video)}
              activeOpacity={0.8}
            >
              {isDownloaded ? (
                <CheckCircle size={16} color="#059669" />
              ) : (
                <Download size={16} color={THEME.colors.textPrimary} />
              )}
              <Text style={[styles.actionChipText, isDownloaded && { color: '#059669', fontWeight: '800' }]}>
                {isDownloaded ? 'Téléchargé' : 'Télécharger'}
              </Text>
            </TouchableOpacity>

            {/* 3. Bouton Options 3 points */}
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.8}
            >
              <MoreVertical size={16} color={THEME.colors.textPrimary} />
              <Text style={styles.actionChipText}>Options</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.sectionDivider} />

        {/* Section Suggestions & Autres Vidéos */}
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedHeading}>À regarder ensuite</Text>

          {suggestedVideos && suggestedVideos.length > 0 ? (
            suggestedVideos
              .filter((v) => v.id !== video.id)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestedCard}
                  onPress={() => {
                    if (onSelectVideo) onSelectVideo(item);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.suggestedThumbBox}>
                    <Image
                      source={{ uri: item.thumbnail || item.thumbnail_url || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=500' }}
                      style={styles.suggestedThumb}
                    />
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationBadgeText}>{item.duration || '04:30'}</Text>
                    </View>
                  </View>
                  <View style={styles.suggestedDetails}>
                    <Text style={styles.suggestedTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.suggestedChannel}>{item.artist || item.speaker_or_artist || 'Chantre Boniface'}</Text>
                    <Text style={styles.suggestedViews}>{item.views || '12K vues'} • {item.date || 'Récemment'}</Text>
                  </View>
                </TouchableOpacity>
              ))
          ) : (
            <Text style={{ color: THEME.colors.textMuted, fontSize: 12 }}>Aucune autre vidéo disponible.</Text>
          )}
        </View>
      </ScrollView>

      {/* Menu Options BottomSheet */}
      <MediaOptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        item={video}
        isDownloaded={isDownloaded}
        onToggleDownload={() => onToggleDownload(video)}
        onToggleFavorite={handleLike}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // =========================================================================
  // MINI-PLAYER FLOTTANT (PICTURE-IN-PICTURE)
  // =========================================================================
  floatingContainer: {
    position: 'absolute',
    bottom: 60, // Au-dessus de la barre de navigation
    left: 10,
    right: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 9999,
  },
  floatingTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 10,
  },
  floatingVideoWrapper: {
    width: 64,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  floatingVideo: {
    width: '100%',
    height: '100%',
  },
  floatingInfo: {
    flex: 1,
  },
  floatingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  floatingBtn: {
    padding: 6,
  },

  // =========================================================================
  // LECTEUR PLEIN ÉCRAN YOUTUBE
  // =========================================================================
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.background,
    zIndex: 10000,
  },
  videoPlayerBox: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16,
    backgroundColor: '#000000',
    position: 'relative',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
  },
  minimizeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOptionsBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsScroll: {
    flex: 1,
  },
  videoInfoSection: {
    padding: 16,
  },
  mainTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginBottom: 6,
  },
  viewsMeta: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  channelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  channelDetails: {
    flex: 1,
  },
  channelName: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  subscribersCount: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  actionsBar: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  actionsList: {
    gap: 10,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  actionChipActive: {
    backgroundColor: THEME.colors.gold,
  },
  downloadChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  actionChipText: {
    color: THEME.colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionChipTextActive: {
    color: '#FFFFFF',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  suggestedSection: {
    paddingHorizontal: 16,
  },
  suggestedHeading: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  suggestedCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  suggestedThumbBox: {
    width: 120,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  suggestedThumb: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  suggestedDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestedTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  suggestedChannel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  suggestedViews: {
    color: THEME.colors.textMuted,
    fontSize: 10.5,
    marginTop: 2,
  },
});
