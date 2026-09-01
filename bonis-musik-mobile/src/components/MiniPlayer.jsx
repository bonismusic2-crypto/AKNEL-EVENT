import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../constants/theme';

export const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    positionMillis,
    durationMillis,
    togglePlayPause,
    handlePlayNext,
    handlePlayPrevious,
    setIsFullPlayerVisible,
    closeCurrentTrack,
  } = useAudio();

  if (!currentTrack) return null;

  const progressPercent = durationMillis > 0
    ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100))
    : 0;

  return (
    <View style={styles.outerWrapper}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => setIsFullPlayerVisible(true)}
        style={styles.floatingCard}
      >
        {/* Barre de Progression Dorée Subtile au Sommet */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.contentRow}>
          {/* Pochette de l'Album / Chant */}
          <View style={styles.coverWrapper}>
            <Image
              source={{ uri: currentTrack.cover || currentTrack.thumbnail || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=400' }}
              style={styles.cover}
            />
          </View>

          {/* Titre & Sous-titre */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist || 'Chantre Boniface'} • {currentTrack.duration || 'En lecture'}
            </Text>
          </View>

          {/* Commandes de Lecture Réactives */}
          <View style={styles.controls}>
            {/* Précédent */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handlePlayPrevious();
              }}
              style={styles.controlBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SkipBack size={18} color="#D1D5DB" fill="#D1D5DB" />
            </TouchableOpacity>

            {/* Play / Pause Doré */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              style={styles.playPauseCircle}
              activeOpacity={0.85}
            >
              {isPlaying ? (
                <Pause size={18} color="#0D0D0D" fill="#0D0D0D" />
              ) : (
                <Play size={18} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            {/* Suivant */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handlePlayNext();
              }}
              style={styles.controlBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SkipForward size={18} color="#D1D5DB" fill="#D1D5DB" />
            </TouchableOpacity>

            {/* Fermer */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                closeCurrentTrack();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    backgroundColor: 'transparent',
  },
  floatingCard: {
    backgroundColor: '#171717',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.35)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  progressBarBg: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
  },
  coverWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  artist: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    padding: 4,
  },
  playPauseCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
