import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, MoreVertical, Film, BookOpen, Music } from 'lucide-react-native';
import { THEME, useAppTheme } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { MediaService } from '../services/mediaService';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { useAudio } from '../context/AudioContext';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SearchModal } from '../components/SearchModal';

export const MediaLibraryScreen = ({ onSelectAlbum, onSelectClip, onSelectTeaching, currentUser, onOpenPaywall }) => {
  const { theme, isDarkMode } = useAppTheme();
  const { playTrack } = useAudio();
  const [activeSection, setActiveSection] = useState('music'); // 'music', 'clips', 'teachings'
  const [teachingFilter, setTeachingFilter] = useState('Tous');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const checkVipAccess = async () => {
    if (!currentUser) {
      if (onOpenPaywall) onOpenPaywall();
      return false;
    }
    const isSub = await SubscriptionService.isUserSubscribed(currentUser);
    if (!isSub) {
      if (onOpenPaywall) onOpenPaywall();
      return false;
    }
    return true;
  };

  const [albums, setAlbums] = useState(SAMPLE_DATA.audioReleases);
  const [clips, setClips] = useState(SAMPLE_DATA.videoClips);
  const [teachings, setTeachings] = useState(SAMPLE_DATA.teachings);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveContent = async () => {
    try {
      const [liveAlbums, liveClips, liveTeachings] = await Promise.all([
        MediaService.getAlbums(),
        MediaService.getMediaContents('video_clip'),
        MediaService.getMediaContents(null),
      ]);

      if (liveAlbums && liveAlbums.length > 0) setAlbums(liveAlbums);
      if (liveClips && liveClips.length > 0) setClips(liveClips);
      if (liveTeachings && liveTeachings.length > 0) {
        const onlyTeachings = liveTeachings.filter(t => t.type === 'audio' || t.type === 'video');
        if (onlyTeachings.length > 0) setTeachings(onlyTeachings);
      }
    } catch (err) {
      console.warn('Library sync warning:', err);
    }
  };

  useEffect(() => {
    fetchLiveContent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveContent();
    setRefreshing(false);
  };

  const sections = [
    { key: 'music', label: '🎵 Musique', count: albums.length },
    { key: 'clips', label: '🎬 Clips Vidéo', count: clips.length },
    { key: 'teachings', label: '📖 Enseignements', count: teachings.length },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* 1. Header Médiathèque */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Médiathèque</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
            Tout le catalogue officiel du Chantre Boniface
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => setIsSearchModalVisible(true)}
          activeOpacity={0.75}
        >
          <Search size={18} color={theme.colors.gold} />
        </TouchableOpacity>
      </View>

      {/* 2. Onglets de Navigation Supérieurs Soignés */}
      <View style={styles.tabsWrapper}>
        <View style={[styles.tabsPillContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#E5E7EB' }]}>
          {sections.map((sec) => {
            const isSelected = activeSection === sec.key;
            return (
              <TouchableOpacity
                key={sec.key}
                style={[
                  styles.tabItem,
                  isSelected && {
                    backgroundColor: isDarkMode ? '#2D2D2D' : '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDarkMode ? 0.4 : 0.08,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
                onPress={() => setActiveSection(sec.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: theme.colors.textSecondary },
                    isSelected && { color: theme.colors.gold, fontWeight: '800' },
                  ]}
                >
                  {sec.label} ({sec.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. VUE MUSIQUE & ALBUMS (GRILLE 2 COLONNES HARMONIEUSE) */}
      {activeSection === 'music' && (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.albumGridCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectAlbum(item);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.coverWrapper}>
                <Image source={{ uri: item.cover }} style={styles.coverImage} />
                <View style={[styles.albumPlayBadge, { backgroundColor: theme.colors.gold }]}>
                  <Play size={16} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 2 }} />
                </View>
              </View>
              <View style={styles.albumMetaBox}>
                <Text style={[styles.albumTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.albumYear, { color: theme.colors.textMuted }]}>
                  {item.year || '2026'} • {item.tracks?.length || 0} titres
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 4. VUE CLIPS VIDÉOS (CARTES 16:9 PROPRES) */}
      {activeSection === 'clips' && (
        <FlatList
          data={clips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.clipCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectClip(item);
              }}
              activeOpacity={0.88}
            >
              <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                  <View style={[styles.playCircle, { backgroundColor: theme.colors.gold }]}>
                    <Play size={22} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 2 }} />
                  </View>
                </View>
                <View style={styles.durationTag}>
                  <Text style={styles.durationText}>{item.duration || '04:30'}</Text>
                </View>
              </View>
              <View style={styles.clipInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clipTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.clipMeta, { color: theme.colors.textMuted }]}>
                    HD 4K • {item.date || 'Sortie Officielle'} • Chantre Boniface
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMenuItem({ ...item, type: 'video' });
                    setIsMenuVisible(true);
                  }}
                  style={styles.moreBtn}
                  activeOpacity={0.7}
                >
                  <MoreVertical size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 5. VUE ENSEIGNEMENTS & PODCASTS */}
      {activeSection === 'teachings' && (
        <View style={{ flex: 1 }}>
          {/* Sous-filtres Audio / Vidéo */}
          <View style={styles.subFiltersRow}>
            {['Tous', 'Audio', 'Vidéo'].map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[
                  styles.subFilterChip,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  teachingFilter === sub && { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
                ]}
                onPress={() => setTeachingFilter(sub)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.subFilterText,
                    { color: theme.colors.textSecondary },
                    teachingFilter === sub && { color: '#0D0D0D', fontWeight: '800' },
                  ]}
                >
                  {sub === 'Tous' ? '✨ Tous' : sub === 'Audio' ? '🎙️ Audio' : '🎥 Vidéo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={teachings.filter((t) => {
              if (teachingFilter === 'Tous') return true;
              if (teachingFilter === 'Audio') return t.type === 'audio' || t.category === 'teaching_audio';
              if (teachingFilter === 'Vidéo') return t.type === 'video' || t.category === 'teaching_video';
              return true;
            })}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.teachingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={async () => {
                  const allowed = await checkVipAccess();
                  if (!allowed) return;

                  if (item.type === 'audio' || item.url) {
                    playTrack({
                      id: item.id,
                      title: item.title,
                      artist: 'Chantre Boniface',
                      album: 'Enseignement',
                      cover: item.thumbnail,
                      duration: item.duration,
                      url: item.url || item.videoUrl,
                      type: 'teaching',
                    });
                  } else {
                    onSelectTeaching(item);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.teachingThumbWrapper}>
                  <Image source={{ uri: item.thumbnail }} style={styles.teachingThumb} />
                  <View style={styles.teachingTypeBadge}>
                    <Text style={styles.teachingTypeBadgeText}>
                      {item.type === 'video' || item.category === 'teaching_video' ? '🎥 Vidéo' : '🎙️ Audio'}
                    </Text>
                  </View>
                </View>

                <View style={styles.teachingInfo}>
                  <Text style={[styles.teachingTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.teachingMeta, { color: theme.colors.textMuted }]}>
                    ⏱️ {item.duration || '20 min'} • {item.speaker_or_artist || 'Chantre Boniface'}
                  </Text>
                </View>

                <View style={[styles.playMiniBtn, { backgroundColor: 'rgba(197, 155, 39, 0.15)' }]}>
                  <Play size={14} color={theme.colors.gold} fill={theme.colors.gold} style={{ marginLeft: 2 }} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Menu d'options des médias */}
      <MediaOptionsMenu
        visible={isMenuVisible}
        onClose={() => {
          setIsMenuVisible(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
      />

      {/* Modal de recherche globale */}
      <SearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        albums={albums}
        clips={clips}
        teachings={teachings}
        onSelectAlbum={(album) => {
          setIsSearchModalVisible(false);
          onSelectAlbum(album);
        }}
        onSelectClip={(clip) => {
          setIsSearchModalVisible(false);
          onSelectClip(clip);
        }}
        onSelectTeaching={(teaching) => {
          setIsSearchModalVisible(false);
          onSelectTeaching(teaching);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsPillContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  tabItemText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 28,
    gap: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  /* ALBUMS GRID */
  albumGridCard: {
    width: '48%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  coverWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  albumPlayBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  albumMetaBox: {
    padding: 10,
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  albumYear: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },

  /* CLIPS */
  clipCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  durationTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  clipInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  clipTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  clipMeta: {
    fontSize: 11.5,
    marginTop: 2,
  },
  moreBtn: {
    padding: 6,
  },

  /* ENSEIGNEMENTS */
  subFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  subFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  teachingThumbWrapper: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  teachingThumb: {
    width: '100%',
    height: '100%',
  },
  teachingTypeBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  teachingTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  teachingInfo: {
    flex: 1,
  },
  teachingTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  teachingMeta: {
    fontSize: 11,
    marginTop: 3,
  },
  playMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
