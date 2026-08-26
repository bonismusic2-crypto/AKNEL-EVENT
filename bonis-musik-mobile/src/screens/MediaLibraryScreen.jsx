import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, MoreVertical } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { MediaService } from '../services/mediaService';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { useAudio } from '../context/AudioContext';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SearchModal } from '../components/SearchModal';

export const MediaLibraryScreen = ({ onSelectAlbum, onSelectClip, onSelectTeaching, currentUser, onOpenPaywall }) => {
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
    { key: 'music', label: `🎵 Musique (${albums.length})` },
    { key: 'clips', label: `🎬 Clips (${clips.length})` },
    { key: 'teachings', label: `📖 Enseignements (${teachings.length})` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER MÉDIATHÈQUE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Médiathèque</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsSearchModalVisible(true)}
          activeOpacity={0.75}
        >
          <Search size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Sélecteur d'onglets (Albums / Clips / Enseignements) */}
      <View style={styles.sectionTabsContainer}>
        {sections.map((sec) => {
          const isSelected = activeSection === sec.key;
          return (
            <TouchableOpacity
              key={sec.key}
              style={[styles.sectionTab, isSelected && styles.sectionTabActive]}
              onPress={() => setActiveSection(sec.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sectionTabText, isSelected && styles.sectionTabTextActive]}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 1. VUE MUSIQUE & ALBUMS */}
      {activeSection === 'music' && (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.gold} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectAlbum(item);
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.cover }} style={styles.coverImage} />
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.year}>{item.year} • {item.tracks?.length || 0} titres</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 2. VUE CLIPS VIDÉOS */}
      {activeSection === 'clips' && (
        <FlatList
          data={clips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.gold} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.clipCard}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectClip(item);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                  <View style={styles.playCircle}>
                    <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.durationTag}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clipTitle}>{item.title}</Text>
                  <Text style={styles.meta}>{item.date || 'Récemment'} • {item.views}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMenuItem({ ...item, type: 'video' });
                    setIsMenuVisible(true);
                  }}
                  style={{ padding: 6 }}
                  activeOpacity={0.7}
                >
                  <MoreVertical size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 3. VUE ENSEIGNEMENTS */}
      {activeSection === 'teachings' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subFiltersRow}>
            {['Tous', 'Audio', 'Vidéo'].map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[styles.subFilterChip, teachingFilter === sub && styles.subFilterChipActive]}
                onPress={() => setTeachingFilter(sub)}
              >
                <Text style={[styles.subFilterText, teachingFilter === sub && styles.subFilterTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={teachings.filter((t) => {
              if (teachingFilter === 'Tous') return true;
              if (teachingFilter === 'Audio') return t.type === 'audio';
              if (teachingFilter === 'Vidéo') return t.type === 'video';
              return true;
            })}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.gold} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.teachingCard}
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
                activeOpacity={0.75}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.teachingThumb} />
                <View style={styles.teachingInfo}>
                  <Text style={styles.teachingTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.meta}>
                    {item.type === 'audio' ? '🎙️ Audio' : '🎥 Vidéo'} • {item.duration}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.playMiniBtn}>
                    <Play size={16} color={THEME.colors.gold} fill={THEME.colors.gold} />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMenuItem(item);
                      setIsMenuVisible(true);
                    }}
                    style={{ padding: 6 }}
                    activeOpacity={0.7}
                  >
                    <MoreVertical size={18} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Modal Options 3 points (Téléchargement & Favoris) */}
      <MediaOptionsMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        item={selectedMenuItem}
        onPlayDirect={(item) => {
          if (item.type === 'video') {
            onSelectClip(item);
          } else {
            playTrack(item);
          }
        }}
        onToggleDownload={async (item) => {
          await DownloadService.toggleDownload(item);
        }}
        onToggleFavorite={(item) => {
          Alert.alert('Favoris', `"${item.title}" a été ajouté à vos favoris.`);
        }}
      />

      {/* Modal Recherche Complète */}
      <SearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        albums={albums}
        clips={clips}
        teachings={teachings}
        onSelectAlbum={onSelectAlbum}
        onSelectClip={onSelectClip}
        onPlayTrack={playTrack}
        onSelectTeaching={onSelectTeaching}
        onOpenOptions={(item) => {
          setSelectedMenuItem(item);
          setIsMenuVisible(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  sectionTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTabText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTabTextActive: {
    color: THEME.colors.gold,
    fontWeight: '800',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '47%',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  year: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  clipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  durationTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    padding: 14,
    gap: 4,
  },
  clipTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  subFiltersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  subFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subFilterChipActive: {
    backgroundColor: THEME.colors.gold,
    borderColor: THEME.colors.gold,
  },
  subFilterText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  teachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  teachingThumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  teachingInfo: {
    flex: 1,
    gap: 4,
  },
  teachingTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  playMiniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
