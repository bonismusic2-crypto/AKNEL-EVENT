import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Play, Shuffle, Heart, MoreVertical, Film, Music, Download } from 'lucide-react-native';
import { THEME, useAppTheme } from '../constants/theme';
import { useAudio } from '../context/AudioContext';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SAMPLE_DATA } from '../data/sampleData';

export const AlbumDetailScreen = ({ album, onBack, currentUser, onOpenPaywall, onPlayVideo }) => {
  const { theme, isDarkMode } = useAppTheme();
  const { playTrack, toggleFavorite, isTrackFavorite } = useAudio();
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' (Audios), 'clips' (Vidéos de l'album)
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const handlePlayTrack = async (track) => {
    if (currentUser) {
      const isSub = await SubscriptionService.isUserSubscribed(currentUser);
      if (!isSub) {
        if (onOpenPaywall) onOpenPaywall();
        return;
      }
    } else {
      if (onOpenPaywall) onOpenPaywall();
      return;
    }
    const fullAlbumPlaylist = tracks.map(t => ({
      ...t,
      cover: album.cover,
      album: album.title,
      artist: album.artist || 'Chantre Boniface',
    }));
    playTrack({ ...track, cover: album.cover, album: album.title }, fullAlbumPlaylist);
  };

  const handlePlayClip = async (clip) => {
    if (currentUser) {
      const isSub = await SubscriptionService.isUserSubscribed(currentUser);
      if (!isSub) {
        if (onOpenPaywall) onOpenPaywall();
        return;
      }
    } else {
      if (onOpenPaywall) onOpenPaywall();
      return;
    }
    if (onPlayVideo) {
      onPlayVideo(clip);
    }
  };

  // Pistes audios de l'album
  const tracks = album.tracks && album.tracks.length > 0 ? album.tracks : [
    { id: 101, title: 'Élévation', duration: '04:25', liked: true },
    { id: 102, title: 'Ton amour est fidèle', duration: '05:12', liked: false },
    { id: 103, title: 'Grâce infinie', duration: '04:50', liked: true },
    { id: 104, title: 'Oui tu es Dieu', duration: '06:05', liked: false },
    { id: 105, title: "Je t'adore", duration: '04:18', liked: false },
  ];

  // Clips vidéos attachés à cet album
  const albumClips = album.clips && album.clips.length > 0 ? album.clips : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.moreBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => {
              setSelectedMenuItem({
                id: album.id,
                title: album.title,
                artist: album.artist || 'Chantre Boniface',
                thumbnail: album.cover,
                type: 'audio',
              });
              setIsMenuVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Pochette de l'album & Infos */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: album.cover }} style={[styles.coverImage, { borderColor: theme.colors.border }]} />
          <Text style={[styles.albumTitle, { color: theme.colors.textPrimary }]}>{album.title}</Text>
          <Text style={[styles.albumMeta, { color: theme.colors.textSecondary }]}>
            {album.artist || 'Chantre Boniface'} • {album.year || '2026'} • {tracks.length} titres {albumClips.length > 0 ? `• ${albumClips.length} clips vidéos` : ''}
          </Text>
        </View>

        {/* Boutons d'Action (Lecture & Aléatoire) */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.playAllBtn, { backgroundColor: theme.colors.gold }]}
            onPress={() => handlePlayTrack({ ...tracks[0], cover: album.cover, album: album.title })}
            activeOpacity={0.85}
          >
            <Play size={18} color="#0D0D0D" fill="#0D0D0D" />
            <Text style={styles.playAllText}>Tout écouter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shuffleBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gold }]}
            onPress={() => {
              const randomIndex = Math.floor(Math.random() * tracks.length);
              handlePlayTrack({ ...tracks[randomIndex], cover: album.cover, album: album.title });
            }}
            activeOpacity={0.85}
          >
            <Shuffle size={18} color={theme.colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Onglets Pistes Audio vs Clips Vidéos de l'Album (affiché si clips présents) */}
        {albumClips.length > 0 && (
          <View style={[styles.tabsRow, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tabChip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                activeTab === 'tracks' && { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold }
              ]}
              onPress={() => setActiveTab('tracks')}
              activeOpacity={0.8}
            >
              <Music size={15} color={activeTab === 'tracks' ? '#0D0D0D' : theme.colors.textSecondary} />
              <Text style={[styles.tabChipText, { color: activeTab === 'tracks' ? '#0D0D0D' : theme.colors.textSecondary, fontWeight: activeTab === 'tracks' ? '800' : '600' }]}>
                Pistes Audio ({tracks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabChip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                activeTab === 'clips' && { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold }
              ]}
              onPress={() => setActiveTab('clips')}
              activeOpacity={0.8}
            >
              <Film size={15} color={activeTab === 'clips' ? '#0D0D0D' : theme.colors.textSecondary} />
              <Text style={[styles.tabChipText, { color: activeTab === 'clips' ? '#0D0D0D' : theme.colors.textSecondary, fontWeight: activeTab === 'clips' ? '800' : '600' }]}>
                Clips Vidéos HD ({albumClips.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. VUE PISTES AUDIO */}
        {activeTab === 'tracks' && (
          <View style={styles.trackList}>
            {tracks.map((track, index) => {
              const trackNumber = (index + 1).toString().padStart(2, '0');
              const isLiked = isTrackFavorite(track.id);

              return (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.trackItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => handlePlayTrack({ ...track, cover: album.cover, album: album.title })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.trackNumber, { color: theme.colors.gold }]}>{trackNumber}</Text>
                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, { color: theme.colors.textPrimary }]}>{track.title}</Text>
                    <Text style={[styles.trackArtist, { color: theme.colors.textMuted }]}>{album.artist || 'Chantre Boniface'} • {track.duration || '04:30'}</Text>
                  </View>
                  <View style={styles.trackActions}>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => toggleFavorite(track)}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={18}
                        color={isLiked ? '#EF4444' : theme.colors.textMuted}
                        fill={isLiked ? '#EF4444' : 'transparent'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => {
                        setSelectedMenuItem({
                          id: track.id,
                          title: track.title,
                          artist: album.artist || 'Chantre Boniface',
                          album: album.title,
                          thumbnail: album.cover,
                          type: 'audio',
                        });
                        setIsMenuVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <MoreVertical size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 2. VUE CLIPS VIDÉOS DE L'ALBUM */}
        {activeTab === 'clips' && (
          <View style={styles.clipsGrid}>
            {albumClips.map((clip) => (
              <TouchableOpacity
                key={clip.id}
                style={[styles.clipCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => handlePlayClip(clip)}
                activeOpacity={0.85}
              >
                <View style={styles.clipThumbBox}>
                  <Image source={{ uri: clip.thumbnail }} style={styles.clipThumb} />
                  <View style={styles.playBadge}>
                    <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>{clip.duration || '04:30'}</Text>
                  </View>
                </View>
                <View style={styles.clipDetails}>
                  <Text style={[styles.clipTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{clip.title}</Text>
                  <Text style={[styles.clipMeta, { color: theme.colors.textMuted }]}>{clip.views || '12K vues'} • Clip Officiel</Text>
                </View>
                <TouchableOpacity
                  style={styles.clipOptionsBtn}
                  onPress={() => {
                    setSelectedMenuItem({
                      ...clip,
                      album: album.title,
                      type: 'video',
                    });
                    setIsMenuVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <MoreVertical size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal Options 3 points (Téléchargement & Favoris) */}
      <MediaOptionsMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        item={selectedMenuItem}
        onPlayDirect={(item) => {
          if (item.type === 'video') {
            handlePlayClip(item);
          } else {
            handlePlayTrack({ ...item, cover: album.cover, album: album.title });
          }
        }}
        isDownloaded={false}
        onToggleDownload={async () => {
          if (selectedMenuItem) {
            await DownloadService.toggleDownload(selectedMenuItem);
          }
        }}
        onToggleFavorite={() => {
          if (selectedMenuItem) {
            toggleFavorite(selectedMenuItem);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  coverImage: {
    width: 220,
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  albumMeta: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  playAllText: {
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: '800',
  },
  shuffleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12.5,
  },
  trackList: {
    gap: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  trackNumber: {
    fontSize: 13,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackArtist: {
    fontSize: 11.5,
    marginTop: 2,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    padding: 6,
  },
  clipsGrid: {
    gap: 12,
  },
  clipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  clipThumbBox: {
    width: 90,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  clipThumb: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -14,
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  clipDetails: {
    flex: 1,
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  clipMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  clipOptionsBtn: {
    padding: 6,
  },
});
