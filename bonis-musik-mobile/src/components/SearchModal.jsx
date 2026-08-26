import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Music,
  Disc,
  Video,
  BookOpen,
  Play,
  MoreVertical,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';

export const SearchModal = ({
  visible,
  onClose,
  albums = [],
  clips = [],
  teachings = [],
  onSelectAlbum,
  onSelectClip,
  onPlayTrack,
  onSelectTeaching,
  onOpenOptions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'songs', 'albums', 'clips', 'teachings'

  // Extraction de toutes les chansons individuelles contenues dans les albums
  const allTracks = useMemo(() => {
    const tracksList = [];
    albums.forEach((album) => {
      if (album.tracks && album.tracks.length > 0) {
        album.tracks.forEach((t) => {
          tracksList.push({
            id: `track-${album.id}-${t.id}`,
            trackId: t.id,
            title: t.title,
            artist: 'Chantre Boniface',
            album: album.title,
            albumId: album.id,
            cover: album.cover,
            duration: t.duration || '04:30',
            type: 'song',
            rawTrack: t,
            rawAlbum: album,
          });
        });
      }
    });
    return tracksList;
  }, [albums]);

  // Filtrage intelligent multi-critères
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    let results = [];

    // 1. Chansons
    if (activeFilter === 'all' || activeFilter === 'songs') {
      const filteredSongs = allTracks.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query)
      );
      results.push(...filteredSongs);
    }

    // 2. Albums
    if (activeFilter === 'all' || activeFilter === 'albums') {
      const filteredAlbums = albums.filter((a) =>
        a.title.toLowerCase().includes(query) ||
        (a.year && a.year.toString().includes(query))
      ).map((a) => ({
        id: `album-${a.id}`,
        title: a.title,
        artist: 'Chantre Boniface',
        year: a.year,
        cover: a.cover,
        type: 'album',
        rawAlbum: a,
      }));
      results.push(...filteredAlbums);
    }

    // 3. Clips Vidéos
    if (activeFilter === 'all' || activeFilter === 'clips') {
      const filteredClips = clips.filter((c) =>
        c.title.toLowerCase().includes(query) ||
        (c.artist && c.artist.toLowerCase().includes(query))
      ).map((c) => ({
        id: `clip-${c.id}`,
        title: c.title,
        artist: c.artist || 'Chantre Boniface',
        thumbnail: c.thumbnail,
        duration: c.duration,
        views: c.views,
        type: 'clip',
        rawClip: c,
      }));
      results.push(...filteredClips);
    }

    // 4. Enseignements & Prédications
    if (activeFilter === 'all' || activeFilter === 'teachings') {
      const filteredTeachings = teachings.filter((tea) =>
        tea.title.toLowerCase().includes(query) ||
        (tea.description && tea.description.toLowerCase().includes(query))
      ).map((tea) => ({
        id: `teaching-${tea.id}`,
        title: tea.title,
        artist: 'Pasteur / Chantre Boniface',
        thumbnail: tea.thumbnail,
        duration: tea.duration,
        type: 'teaching',
        rawTeaching: tea,
      }));
      results.push(...filteredTeachings);
    }

    return results;
  }, [searchQuery, activeFilter, allTracks, albums, clips, teachings]);

  const handleSelectResult = (item) => {
    onClose();
    if (item.type === 'song') {
      if (onPlayTrack) {
        onPlayTrack({
          id: item.trackId,
          title: item.title,
          artist: item.artist,
          album: item.album,
          cover: item.cover,
          duration: item.duration,
        });
      }
    } else if (item.type === 'album') {
      if (onSelectAlbum) onSelectAlbum(item.rawAlbum);
    } else if (item.type === 'clip') {
      if (onSelectClip) onSelectClip(item.rawClip);
    } else if (item.type === 'teaching') {
      if (onSelectTeaching) onSelectTeaching(item.rawTeaching);
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'song':
        return { label: 'Chant Audio', bg: '#EFF6FF', text: '#2563EB', icon: <Music size={11} color="#2563EB" /> };
      case 'album':
        return { label: 'Album', bg: '#FDF4FF', text: '#A21CAF', icon: <Disc size={11} color="#A21CAF" /> };
      case 'clip':
        return { label: 'Clip Vidéo HD', bg: '#FEF3C7', text: '#92400E', icon: <Video size={11} color="#92400E" /> };
      case 'teaching':
        return { label: 'Enseignement', bg: '#DCFCE7', text: '#166534', icon: <BookOpen size={11} color="#166534" /> };
      default:
        return { label: 'Contenu', bg: '#F3F4F6', text: '#4B5563', icon: <Sparkles size={11} color="#4B5563" /> };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header avec Barre de Saisie Interactive */}
        <View style={styles.header}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color={THEME.colors.gold} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher chanson, album, clip..."
              placeholderTextColor={THEME.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>

        {/* Filtres par Catégorie (Chips) */}
        <View style={styles.filtersContainer}>
          {[
            { id: 'all', label: 'Tout' },
            { id: 'songs', label: '🎵 Chants' },
            { id: 'albums', label: '💿 Albums' },
            { id: 'clips', label: '🎥 Clips' },
            { id: 'teachings', label: '📖 Prédications' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, activeFilter === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Liste des Résultats */}
        {searchQuery.trim().length === 0 ? (
          <View style={styles.emptySearch}>
            <Search size={48} color="rgba(197, 155, 39, 0.25)" />
            <Text style={styles.emptyTitle}>Trouvez vos cantiques préférés</Text>
            <Text style={styles.emptySubtitle}>
              Tapez le nom d'un chant (ex: "Élévation", "Fidèle"), d'un album ou d'une prédication pour lancer la lecture instantanément.
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptySearch}>
            <Disc size={44} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Aucun média ne correspond à "{searchQuery}". Vérifiez l'orthographe ou essayez un autre mot-clé.
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const badge = getBadgeStyle(item.type);
              const imageUri = item.cover || item.thumbnail || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=500';

              return (
                <TouchableOpacity
                  style={styles.resultCard}
                  onPress={() => handleSelectResult(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imageUri }} style={styles.resultImage} />

                  <View style={styles.resultInfo}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        {badge.icon}
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultMeta} numberOfLines={1}>
                      {item.artist} {item.album ? `• ${item.album}` : ''} {item.duration ? `• ${item.duration}` : ''}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.playIconCircle}>
                      <Play size={14} color={THEME.colors.gold} fill={THEME.colors.gold} />
                    </View>
                    {onOpenOptions && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          onOpenOptions(item);
                        }}
                        style={{ padding: 6 }}
                      >
                        <MoreVertical size={18} color={THEME.colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.gold,
  },
  filterChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsList: {
    padding: 16,
    paddingBottom: 30,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  resultTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '800',
  },
  resultMeta: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
