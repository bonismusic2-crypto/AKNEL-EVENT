import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDown,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Download,
  CheckCircle,
  MoreVertical,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2
} from 'lucide-react-native';
import { THEME, useAppTheme } from '../constants/theme';
import { useAudio } from '../context/AudioContext';
import { DownloadService } from '../services/downloadService';
import { MediaOptionsMenu } from './MediaOptionsMenu';

export const FullAudioPlayerModal = () => {
  const { theme, isDarkMode } = useAppTheme();
  const {
    currentTrack,
    isPlaying,
    positionMillis,
    durationMillis,
    togglePlayPause,
    handlePlayNext,
    handlePlayPrevious,
    isFullPlayerVisible,
    setIsFullPlayerVisible,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    toggleFavorite,
    isTrackFavorite,
    seekTo,
  } = useAudio();

  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  if (!currentTrack) return null;

  const isLiked = isTrackFavorite(currentTrack.id);

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationMillis > 0 ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100)) : 0;

  const handleToggleDownload = async () => {
    await DownloadService.toggleDownload(currentTrack);
    setIsDownloaded(!isDownloaded);
  };

  return (
    <Modal
      visible={isFullPlayerVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsFullPlayerVisible(false)}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D0D' }]}>
        {/* 1. Header avec Bouton Retour Bien Visible & Titre */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setIsFullPlayerVisible(false)}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronDown size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerSubtitle, { color: theme.colors.gold }]}>EN LECTURE</Text>
            <Text style={styles.headerAlbum} numberOfLines={1}>
              {currentTrack.album || 'Bonis Musik'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.optionsBtn}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            <MoreVertical size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 2. Pochette Centrale HD */}
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: currentTrack.cover || currentTrack.thumbnail || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800' }}
            style={styles.cover}
          />
        </View>

        {/* 3. Titre & Artiste & Bouton Favoris / Download */}
        <View style={styles.trackInfoRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artistName}>{currentTrack.artist || 'Chantre Boniface'}</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={handleToggleDownload}
              style={styles.actionIconBtn}
              activeOpacity={0.7}
            >
              {isDownloaded ? (
                <CheckCircle size={22} color={theme.colors.gold} />
              ) : (
                <Download size={22} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {/* Bouton Favoris Cœur Rouge Réactif */}
            <TouchableOpacity
              onPress={() => toggleFavorite(currentTrack)}
              style={styles.actionIconBtn}
              activeOpacity={0.7}
            >
              <Heart
                size={24}
                color={isLiked ? '#EF4444' : '#9CA3AF'}
                fill={isLiked ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Timeline & Progression Temps Réel */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.colors.gold }]} />
            <View style={[styles.progressKnob, { left: `${progressPercent}%`, backgroundColor: theme.colors.gold }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
            <Text style={styles.timeText}>{currentTrack.duration || formatTime(durationMillis)}</Text>
          </View>
        </View>

        {/* 5. Commandes de Lecture : Shuffle, Précédent, Play/Pause, Suivant, Repeat */}
        <View style={styles.controlsRow}>
          {/* Bouton Mode Aléatoire (Shuffle) */}
          <TouchableOpacity
            style={[styles.secondaryControlBtn, isShuffle && styles.activeControlBtn]}
            onPress={toggleShuffle}
            activeOpacity={0.7}
          >
            <Shuffle size={22} color={isShuffle ? theme.colors.gold : '#9CA3AF'} />
          </TouchableOpacity>

          {/* Morceau Précédent */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handlePlayPrevious}
            activeOpacity={0.7}
          >
            <SkipBack size={26} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>

          {/* Bouton Central Play / Pause Doré */}
          <TouchableOpacity style={[styles.playPauseBtn, { backgroundColor: theme.colors.gold }]} onPress={togglePlayPause} activeOpacity={0.85}>
            {isPlaying ? (
              <Pause size={32} color="#0D0D0D" fill="#0D0D0D" />
            ) : (
              <Play size={32} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          {/* Morceau Suivant */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handlePlayNext}
            activeOpacity={0.7}
          >
            <SkipForward size={26} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>

          {/* Bouton Répétition (Repeat Off / All / One) */}
          <TouchableOpacity
            style={[styles.secondaryControlBtn, repeatMode !== 'off' && styles.activeControlBtn]}
            onPress={toggleRepeat}
            activeOpacity={0.7}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={22} color={theme.colors.gold} />
            ) : (
              <Repeat size={22} color={repeatMode === 'all' ? theme.colors.gold : '#9CA3AF'} />
            )}
          </TouchableOpacity>
        </View>

        {/* 6. Bouton de Réduction / Fermeture */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.closePlayerBtn}
            onPress={() => setIsFullPlayerVisible(false)}
            activeOpacity={0.8}
          >
            <ArrowLeft size={16} color="#9CA3AF" />
            <Text style={styles.closePlayerText}>Réduire & continuer l'écoute</Text>
          </TouchableOpacity>
        </View>

        {/* Modal d'Options */}
        <MediaOptionsMenu
          visible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
          item={{ ...currentTrack, type: 'audio' }}
          isDownloaded={isDownloaded}
          onToggleDownload={handleToggleDownload}
          onToggleFavorite={() => toggleFavorite(currentTrack)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerAlbum: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  coverWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  cover: {
    width: 280,
    height: 280,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  artistName: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIconBtn: {
    padding: 6,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#262626',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -4,
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 10,
  },
  secondaryControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControlBtn: {
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
  },
  skipBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBar: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  closePlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  closePlayerText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
});
