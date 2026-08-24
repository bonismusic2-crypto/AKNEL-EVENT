import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, ListMusic, AlignLeft } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useAudio } from '../context/AudioContext';

export const FullAudioPlayerModal = () => {
  const {
    currentTrack,
    isPlaying,
    positionMillis,
    durationMillis,
    togglePlayPause,
    isFullPlayerVisible,
    setIsFullPlayerVisible,
  } = useAudio();

  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationMillis > 0 ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100)) : 0;

  return (
    <Modal
      visible={isFullPlayerVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header Modal */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsFullPlayerVisible(false)} style={styles.iconBtn}>
            <ChevronDown size={28} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>EN LECTURE ACTUELLE</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <ListMusic size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Pochette Centrale */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: currentTrack.cover }} style={styles.cover} />
        </View>

        {/* Titre & Artiste & Like */}
        <View style={styles.trackInfoRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            <Text style={styles.artistName}>{currentTrack.artist || 'Chantre Boniface'}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.heartBtn}>
            <Heart
              size={22}
              color={isLiked ? THEME.colors.gold : THEME.colors.textSecondary}
              fill={isLiked ? THEME.colors.gold : 'transparent'}
            />
          </TouchableOpacity>
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

        {/* Commandes Principales */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.skipBtn}>
            <SkipBack size={26} color={THEME.colors.textPrimary} fill={THEME.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause} activeOpacity={0.85}>
            {isPlaying ? (
              <Pause size={32} color="#0D0D0D" fill="#0D0D0D" />
            ) : (
              <Play size={32} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn}>
            <SkipForward size={26} color={THEME.colors.textPrimary} fill={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Actions Inférieures (Paroles / File d'attente) */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomBtn}>
            <AlignLeft size={18} color={THEME.colors.textSecondary} />
            <Text style={styles.bottomBtnText}>Paroles</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn}>
            <ListMusic size={18} color={THEME.colors.textSecondary} />
            <Text style={styles.bottomBtnText}>File d'attente</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 6,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  coverWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cover: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  trackTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  artistName: {
    color: THEME.colors.gold,
    fontSize: 15,
    marginTop: 4,
  },
  heartBtn: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 20,
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
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 10,
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
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  bottomBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
