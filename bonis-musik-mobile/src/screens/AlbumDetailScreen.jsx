import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Play, Shuffle, Heart, MoreVertical } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useAudio } from '../context/AudioContext';

export const AlbumDetailScreen = ({ album, onBack }) => {
  const { playTrack } = useAudio();

  const tracks = album.tracks && album.tracks.length > 0 ? album.tracks : [
    { id: 101, title: 'Élévation', duration: '04:25', liked: true },
    { id: 102, title: 'Ton amour est fidèle', duration: '05:12', liked: false },
    { id: 103, title: 'Grâce infinie', duration: '04:50', liked: true },
    { id: 104, title: 'Oui tu es Dieu', duration: '06:05', liked: false },
    { id: 105, title: "Je t'adore", duration: '04:18', liked: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreBtn}>
            <MoreVertical size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Jaquette d'Album */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: album.cover }} style={styles.cover} />
        </View>

        {/* Titre et Détails */}
        <Text style={styles.albumTitle}>{album.title}</Text>
        <Text style={styles.artistName}>Chantre Boniface</Text>
        <Text style={styles.albumMeta}>Album • {album.year} • {tracks.length} titres</Text>

        {/* Boutons d'Action Tout Écouter / Aléatoire */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.playAllBtn}
            onPress={() => playTrack({ ...tracks[0], cover: album.cover, album: album.title })}
            activeOpacity={0.8}
          >
            <Play size={18} color="#0D0D0D" fill="#0D0D0D" />
            <Text style={styles.playAllText}>Tout écouter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shuffleBtn}
            onPress={() => {
              const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
              playTrack({ ...randomTrack, cover: album.cover, album: album.title });
            }}
            activeOpacity={0.8}
          >
            <Shuffle size={18} color={THEME.colors.textPrimary} />
            <Text style={styles.shuffleText}>Aléatoire</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des Chansons (Pistes) */}
        <View style={styles.trackList}>
          {tracks.map((track, index) => {
            const trackNumber = (index + 1).toString().padStart(2, '0');
            return (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                onPress={() => playTrack({ ...track, cover: album.cover, album: album.title })}
                activeOpacity={0.7}
              >
                <Text style={styles.trackNumber}>{trackNumber}</Text>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackArtist}>Chantre Boniface</Text>
                </View>
                <View style={styles.trackActions}>
                  <TouchableOpacity style={styles.iconAction}>
                    <Heart
                      size={18}
                      color={track.liked ? THEME.colors.gold : THEME.colors.textMuted}
                      fill={track.liked ? THEME.colors.gold : 'transparent'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconAction}>
                    <MoreVertical size={18} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  moreBtn: {
    padding: 6,
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  cover: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  albumTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  artistName: {
    color: THEME.colors.gold,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  albumMeta: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.gold,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  playAllText: {
    color: '#0D0D0D',
    fontWeight: '700',
    fontSize: 14,
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  shuffleText: {
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  trackList: {
    gap: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  trackNumber: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    width: 28,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 8,
  },
  trackTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconAction: {
    padding: 6,
  },
});
