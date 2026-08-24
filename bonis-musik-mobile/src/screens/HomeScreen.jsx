import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';

export const HomeScreen = ({ onSelectAlbum, onSelectClip, onSelectTeaching, onOpenProfile, onOpenPaywall }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header avec Profil cliquable & Notification */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <Image source={{ uri: SAMPLE_DATA.user.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>Bonjour, Bonis 👋</Text>
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>👑 Abonné VIP</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onOpenProfile}>
            <Bell size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Barre de Recherche */}
        <View style={styles.searchBar}>
          <Search size={18} color={THEME.colors.textMuted} />
          <Text style={styles.searchText}>Rechercher un chant, album...</Text>
        </View>

        {/* Bannière Hero Lumineuse & Dorée */}
        <View style={styles.heroCard}>
          <Image source={{ uri: SAMPLE_DATA.heroBanner.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.4)', '#FFFFFF']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeContainer}>
                <Text style={styles.newClipBadge}>{SAMPLE_DATA.heroBanner.badge}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{SAMPLE_DATA.heroBanner.title}</Text>
            <TouchableOpacity
              style={styles.watchBtn}
              onPress={() => onSelectClip(SAMPLE_DATA.videoClips[0])}
              activeOpacity={0.85}
            >
              <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.watchBtnText}>Regarder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Dernières Sorties Audio */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernières sorties audio</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {SAMPLE_DATA.audioReleases.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              onPress={() => onSelectAlbum(album)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: album.cover }} style={styles.albumCover} />
              <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
              <Text style={styles.albumYear}>{album.year}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Clips Récents */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clips récents</Text>
          <TouchableOpacity onPress={() => onSelectClip(SAMPLE_DATA.videoClips[0])}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {SAMPLE_DATA.videoClips.map((clip) => (
            <TouchableOpacity
              key={clip.id}
              style={styles.clipCard}
              onPress={() => onSelectClip(clip)}
              activeOpacity={0.8}
            >
              <View style={styles.clipThumbnailContainer}>
                <Image source={{ uri: clip.thumbnail }} style={styles.clipThumbnail} />
                <View style={styles.durationTag}>
                  <Text style={styles.durationText}>{clip.duration}</Text>
                </View>
              </View>
              <Text style={styles.clipTitle} numberOfLines={1}>{clip.title}</Text>
              <Text style={styles.clipDate}>{clip.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Enseignements Populaires */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Enseignements populaires</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.teachingsList}>
          {SAMPLE_DATA.teachings.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.teachingItem}
              onPress={() => onSelectTeaching(item)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.teachingThumb} />
              <View style={styles.teachingInfo}>
                <Text style={styles.teachingTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.teachingMeta}>
                  {item.type === 'audio' ? '🎙️ Audio' : '🎥 Vidéo'} • {item.duration}
                </Text>
              </View>
              <View style={styles.playMiniBtn}>
                <Play size={14} color={THEME.colors.gold} fill={THEME.colors.gold} />
              </View>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: THEME.colors.gold,
  },
  greeting: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  vipBadge: {
    marginTop: 2,
  },
  vipText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '700',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchText: {
    color: THEME.colors.textMuted,
    fontSize: 14,
  },
  heroCard: {
    height: 195,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
  },
  badgeRow: {
    marginBottom: 4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.3)',
  },
  newClipBadge: {
    color: THEME.colors.gold,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 10,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  seeAll: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalList: {
    gap: 14,
    paddingRight: 20,
    marginBottom: 20,
  },
  albumCard: {
    width: 130,
  },
  albumCover: {
    width: 130,
    height: 130,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  albumTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  albumYear: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  clipCard: {
    width: 180,
  },
  clipThumbnailContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  clipThumbnail: {
    width: 180,
    height: 105,
    backgroundColor: '#F3F4F6',
  },
  durationTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  clipTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  clipDate: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  teachingsList: {
    gap: 12,
  },
  teachingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  teachingThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  teachingInfo: {
    flex: 1,
  },
  teachingTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  teachingMeta: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  playMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
