import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Play, Shuffle, Heart, MoreVertical, Film, Music, Download } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useAudio } from '../context/AudioContext';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SAMPLE_DATA } from '../data/sampleData';

export const AlbumDetailScreen = ({ album, onBack, currentUser, onOpenPaywall, onPlayVideo }) => {
  const { playTrack } = useAudio();
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
    playTrack(track);
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
  const albumClips = album.clips && album.clips.length > 0 ? album.clips : SAMPLE_DATA.videoClips;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => {
              setSelectedMenuItem({
                id: album.id,
                title: album.title,
                artist: 'Chantre Boniface',
                thumbnail: album.cover,
                type: 'audio',
              });
              setIsMenuVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Pochette de l'album & Infos */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: album.cover }} style={styles.coverImage} />
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumMeta}>
            Chantre Boniface • {album.year} • {tracks.length} titres • {albumClips.length} clips vidéos
          </Text>
        </View>

        {/* Boutons d'Action (Lecture & Aléatoire) */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.playAllBtn}
            onPress={() => handlePlayTrack({ ...tracks[0], cover: album.cover, album: album.title })}
            activeOpacity={0.85}
          >
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.playAllText}>Tout écouter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shuffleBtn}
            onPress={() => {
              const randomIndex = Math.floor(Math.random() * tracks.length);
              handlePlayTrack({ ...tracks[randomIndex], cover: album.cover, album: album.title });
            }}
            activeOpacity={0.85}
          >
            <Shuffle size={18} color={THEME.colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Onglets Pistes Audio vs Clips Vidéos de l'Album */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'tracks' && styles.tabChipActive]}
            onPress={() => setActiveTab('tracks')}
            activeOpacity={0.8}
          >
            <Music size={15} color={activeTab === 'tracks' ? '#FFFFFF' : THEME.colors.textSecondary} />
            <Text style={[styles.tabChipText, activeTab === 'tracks' && styles.tabChipTextActive]}>
              Pistes Audio ({tracks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'clips' && styles.tabChipActive]}
            onPress={() => setActiveTab('clips')}
            activeOpacity={0.8}
          >
            <Film size={15} color={activeTab === 'clips' ? '#FFFFFF' : THEME.colors.textSecondary} />
            <Text style={[styles.tabChipText, activeTab === 'clips' && styles.tabChipTextActive]}>
              Clips Vidéos HD ({albumClips.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. VUE PISTES AUDIO */}
        {activeTab === 'tracks' && (
          <View style={styles.trackList}>
            {tracks.map((track, index) => {
              const trackNumber = (index + 1).toString().padStart(2, '0');
              return (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackItem}
                  onPress={() => handlePlayTrack({ ...track, cover: album.cover, album: album.title })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.trackNumber}>{trackNumber}</Text>
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtist}>Chantre Boniface • {track.duration || '04:30'}</Text>
                  </View>
                  <View style={styles.trackActions}>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => Alert.alert('Favoris', `"${track.title}" ajouté à vos favoris.`)}
                    >
                      <Heart
                        size={18}
                        color={track.liked ? THEME.colors.gold : THEME.colors.textMuted}
                        fill={track.liked ? THEME.colors.gold : 'transparent'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => {
                        setSelectedMenuItem({
                          id: track.id,
                          title: track.title,
                          artist: 'Chantre Boniface',
                          album: album.title,
                          thumbnail: album.cover,
                          type: 'audio',
                        });
                        setIsMenuVisible(true);
                      }}
                    >
                      <MoreVertical size={18} color={THEME.colors.textMuted} />
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
                style={styles.clipCard}
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
                  <Text style={styles.clipTitle} numberOfLines={1}>{clip.title}</Text>
                  <Text style={styles.clipMeta}>{clip.views || '12K vues'} • Clip Officiel</Text>
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
                >
                  <MoreVertical size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
        onToggleDownload={async (item) => {
          await DownloadService.toggleDownload({ ...item, cover: album.cover, album: album.title });
        }}
        onToggleFavorite={(item) => {
          Alert.alert('Favoris', `"${item.title}" ajouté à vos favoris.`);
        }}
      />
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  albumTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  albumMeta: {
    color: THEME.colors.textSecondary,
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
    backgroundColor: THEME.colors.gold,
    paddingVertical: 13,
    borderRadius: 25,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  playAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  shuffleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabChipActive: {
    backgroundColor: THEME.colors.gold,
  },
  tabChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  trackList: {
    gap: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  trackNumber: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  trackArtist: {
    color: THEME.colors.textMuted,
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
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  clipThumbBox: {
    width: 90,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  clipThumb: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  clipDetails: {
    flex: 1,
  },
  clipTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  clipMeta: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  clipOptionsBtn: {
    padding: 6,
  },
});
