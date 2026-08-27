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
  Sliders,
  Volume2
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useAudio } from '../context/AudioContext';
import { DownloadService } from '../services/downloadService';
import { MediaOptionsMenu } from './MediaOptionsMenu';

export const FullAudioPlayerModal = () => {
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
  } = useAudio();

  const [isLiked, setIsLiked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  if (!currentTrack) return null;

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
      <SafeAreaView style={styles.container}>
        {/* Header avec Bouton Retour Bien Visible & Options */}
        <View style={styles.header}>
          {/* Bouton Retour Flèche & Réduire */}
          <TouchableOpacity
            onPress={() => setIsFullPlayerVisible(false)}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronDown size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>EN LECTURE</Text>
            <Text style={styles.headerAlbum} numberOfLines={1}>
              {currentTrack.album || 'Bonis Musik'}
            </Text>
          </View>

          {/* Bouton 3 Points Options */}
          <TouchableOpacity
            style={styles.optionsBtn}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            <MoreVertical size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Pochette Centrale */}
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: currentTrack.cover || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800' }}
            style={styles.cover}
          />
        </View>

        {/* Titre & Artiste & Boutons d'Action Rapides */}
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
                <CheckCircle size={22} color={THEME.colors.gold} />
              ) : (
                <Download size={22} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLiked(!isLiked)}
              style={styles.actionIconBtn}
              activeOpacity={0.7}
            >
              <Heart
                size={22}
                color={isLiked ? '#DC2626' : '#9CA3AF'}
                fill={isLiked ? '#DC2626' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline & Progression Temps Réel */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            <View style={[styles.progressKnob, { left: `${progressPercent}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
            <Text style={styles.timeText}>{currentTrack.duration || formatTime(durationMillis)}</Text>
          </View>
        </View>

        {/* Commandes Principales de Lecture */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handlePlayPrevious}
            activeOpacity={0.7}
          >
            <SkipBack size={26} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause} activeOpacity={0.85}>
            {isPlaying ? (
              <Pause size={32} color="#0D0D0D" fill="#0D0D0D" />
            ) : (
              <Play size={32} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handlePlayNext}
            activeOpacity={0.7}
          >
            <SkipForward size={26} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bouton de Fermeture / Retour Inférieur Clair */}
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

        {/* Modal d'Options 3 points */}
        <MediaOptionsMenu
          visible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
          item={{ ...currentTrack, type: 'audio' }}
          isDownloaded={isDownloaded}
          onToggleDownload={handleToggleDownload}
          onToggleFavorite={() => setIsLiked(!isLiked)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
    color: THEME.colors.gold,
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
    width: 270,
    height: 270,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  artistName: {
    color: THEME.colors.gold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#262626',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.gold,
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 6,
  },
  skipBtn: {
    padding: 12,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    marginTop: 8,
  },
  closePlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  closePlayerText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
});
