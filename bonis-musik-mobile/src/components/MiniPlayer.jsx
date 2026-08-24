import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../constants/theme';

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, togglePlayPause, setIsFullPlayerVisible, closeCurrentTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsFullPlayerVisible(true)}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image source={{ uri: currentTrack.cover }} style={styles.cover} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist || 'Chantre Boniface'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
            {isPlaying ? (
              <Pause size={20} color={THEME.colors.textPrimary} />
            ) : (
              <Play size={20} color={THEME.colors.textPrimary} fill={THEME.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={closeCurrentTrack} style={styles.closeBtn}>
            <X size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  artist: {
    color: THEME.colors.gold,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
});
