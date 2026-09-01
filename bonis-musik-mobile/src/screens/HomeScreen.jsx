import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Play, Sparkles, MoreVertical, Calendar, Heart, BookOpen, Film, Music, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, useAppTheme } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { MediaService } from '../services/mediaService';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { NotificationService } from '../services/notificationService';
import { useAudio } from '../context/AudioContext';
import { supabase } from '../lib/supabase';
import { NotificationsModal, INITIAL_MOBILE_NOTIFICATIONS } from '../components/NotificationsModal';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SearchModal } from '../components/SearchModal';

// Versets quotidiens inspirants pour la carte "Verset & Cantique du Jour"
const DAILY_VERSES = [
  {
    verse: "« L'Éternel est ma force et le sujet de mes louanges ; C'est lui qui m'a sauvé. »",
    ref: "Psaume 118:14",
    theme: "Force & Louange",
  },
  {
    verse: "« Poussez vers l'Éternel des cris de joie, vous tous, habitants de la terre ! Servez l'Éternel avec joie. »",
    ref: "Psaume 100:1-2",
    theme: "Adoration & Allégresse",
  },
  {
    verse: "« Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles. »",
    ref: "Ésaïe 40:31",
    theme: "Renouvellement & Foi",
  },
  {
    verse: "« Je puis tout par celui qui me fortifie. »",
    ref: "Philippiens 4:13",
    theme: "Victoire & Puissance",
  },
];

export const HomeScreen = ({
  currentUser,
  onSelectAlbum,
  onSelectClip,
  onSelectTeaching,
  onOpenProfile,
  onOpenPaywall
}) => {
  const { theme, isDarkMode } = useAppTheme();
  const { playTrack } = useAudio();
  const [albums, setAlbums] = useState(SAMPLE_DATA.audioReleases);
  const [clips, setClips] = useState(SAMPLE_DATA.videoClips);
  const [teachings, setTeachings] = useState(SAMPLE_DATA.teachings);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'adoration', 'victory', 'teachings', 'clips'
  const [refreshing, setRefreshing] = useState(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_MOBILE_NOTIFICATIONS);
  const [isSubscribed, setIsSubscribed] = useState(
    SubscriptionService.getFastSubscriptionState(currentUser?.id).isSubscribed || false
  );

  // Verset du jour (sélectionné selon le jour)
  const todayIndex = new Date().getDate() % DAILY_VERSES.length;
  const currentDailyVerse = DAILY_VERSES[todayIndex];

  // Vérifier le statut VIP réel depuis Supabase / Persistance
  const checkVipStatus = async () => {
    if (currentUser) {
      const sub = await SubscriptionService.isUserSubscribed(currentUser);
      setIsSubscribed(sub);
    }
  };

  useEffect(() => {
    checkVipStatus();
    // 🔔 Demander et initialiser les permissions de notifications push système
    NotificationService.registerForPushNotificationsAsync();
  }, [currentUser]);

  // Extraction dynamique du prénom réel de l'utilisateur connecté
  const getFirstName = () => {
    if (currentUser?.user_metadata?.full_name) {
      const parts = currentUser.user_metadata.full_name.trim().split(' ');
      return parts[0];
    }
    if (currentUser?.user_metadata?.name) {
      const parts = currentUser.user_metadata.name.trim().split(' ');
      return parts[0];
    }
    if (currentUser?.email) {
      const emailPrefix = currentUser.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Bien-aimé(e)';
  };

  const firstName = getFirstName();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNavigateAction = (item) => {
    if (item.actionType === 'clip') {
      const heroClip = clips[0] || SAMPLE_DATA.videoClips[0];
      onSelectClip(heroClip);
    } else if (item.actionType === 'teaching') {
      const firstTeaching = teachings[0] || SAMPLE_DATA.teachings[0];
      if (firstTeaching) handleTeachingPress(firstTeaching);
    } else if (item.actionType === 'paywall') {
      onOpenPaywall();
    } else if (item.actionType === 'music') {
      const firstAlbum = albums[0] || SAMPLE_DATA.audioReleases[0];
      if (firstAlbum) onSelectAlbum(firstAlbum);
    } else if (item.actionType === 'concert') {
      Alert.alert(
        'Concert AKNEL Hall',
        'Grand Concert du Chantre Boniface le 15 Décembre 2026 à AKNEL Hall. Billetterie disponible sur le site web AKNEL Event.',
        [{ text: 'Compris' }]
      );
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const mapped = data.map((n) => ({
          id: n.id,
          type: n.type || 'general',
          title: n.title,
          message: n.message,
          time: n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Récemment',
          isRead: n.is_read || false,
          badge: n.badge || 'Bonis Musik',
          badgeBg: n.badge_bg || '#FEF3C7',
          badgeTextColor: n.badge_text_color || '#92400E',
          actionType: n.action_type || 'home',
          actionText: n.action_text || 'Consulter',
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.warn('Notifications fetch warning:', e);
    }
  };

  const loadLiveData = async () => {
    try {
      const [liveAlbums, liveClips, liveTeachings] = await Promise.all([
        MediaService.getAlbums(),
        MediaService.getVideoClips(),
        MediaService.getTeachings(),
      ]);

      if (liveAlbums && liveAlbums.length > 0) setAlbums(liveAlbums);
      if (liveClips && liveClips.length > 0) setClips(liveClips);
      if (liveTeachings && liveTeachings.length > 0) {
        const onlyTeachings = liveTeachings.filter(t => !t.category || t.category.includes('teaching'));
        if (onlyTeachings.length > 0) setTeachings(onlyTeachings);
      }
    } catch (e) {
      console.warn('Sync load warning:', e);
    }
  };

  useEffect(() => {
    loadLiveData();

    // 🔔 Abonnement Temps Réel aux Notifications Supabase
    const notifChannel = supabase
      .channel('bonis-notifications-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = payload.new;
            const newNotif = {
              id: n.id,
              type: n.type || 'general',
              title: n.title,
              message: n.message,
              time: 'À l\'instant',
              isRead: false,
              badge: n.badge || 'Nouveau',
              badgeBg: n.badge_bg || '#DCFCE7',
              badgeTextColor: n.badge_text_color || '#166534',
              actionType: n.action_type || 'home',
              actionText: n.action_text || 'Consulter',
            };
            setNotifications((prev) => [newNotif, ...prev]);

            // 🚀 DÉCLENCHEMENT D'UNE VRAIE NOTIFICATION PUSH BANNIÈRE SYSTÈME + SON
            NotificationService.sendLocalNotification(
              n.title,
              n.message,
              { id: n.id, type: n.type, actionType: n.action_type }
            );
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((item) => (item.id === payload.new.id ? { ...item, isRead: payload.new.is_read } : item))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLiveData(), checkVipStatus(), fetchNotifications()]);
    setRefreshing(false);
  };

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

  const handleTeachingPress = async (item) => {
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
  };

  // Chant recommandé du jour pour méditation
  const featuredSong = albums[0]?.tracks?.[0] || {
    id: 'featured-1',
    title: 'Tu es fidèle',
    artist: 'Chantre Boniface',
    album: 'ÉLÉVATION',
    duration: '04:25',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: albums[0]?.cover || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800',
  };

  const handlePlayFeaturedMeditate = async () => {
    const allowed = await checkVipAccess();
    if (allowed) {
      playTrack({
        ...featuredSong,
        cover: albums[0]?.cover || featuredSong.cover,
        album: albums[0]?.title || 'ÉLÉVATION',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
        }
      >
        {/* ========================================================= */}
        {/* 1. HEADER ROYAL AVEC BOUTON "INVITER" & NOTIFICATIONS */}
        {/* ========================================================= */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>Bonis Musik</Text>
            <Text style={[styles.greetingSubtitle, { color: theme.colors.gold }]}>Bonjour, {firstName} 👋</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Bouton Doré Inviter Prestation */}
            <TouchableOpacity
              style={[styles.inviteHeaderBtn, { backgroundColor: theme.colors.gold }]}
              onPress={onOpenProfile}
              activeOpacity={0.85}
            >
              <Calendar size={13} color="#0D0D0D" strokeWidth={2.5} />
              <Text style={styles.inviteHeaderBtnText}>Inviter</Text>
            </TouchableOpacity>

            {/* Bouton Cloche de Notification */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => setIsNotifModalVisible(true)}
              activeOpacity={0.75}
            >
              <Bell size={20} color={theme.colors.textPrimary} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. CARTE "VERSET & CANTIQUE DU JOUR" (MAQUETTE 2) */}
        {/* ========================================================= */}
        <View style={[styles.dailyCard, { borderColor: theme.colors.cardBorder }]}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B18', '#141312', '#0D0D0D'] : ['#FFFBEB', '#FEF3C7', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dailyCardGradient}
          >
            <View style={styles.dailyHeaderRow}>
              <Text style={[styles.dailyCardTag, { color: theme.colors.gold }]}>🕊️ VERSET & CANTIQUE DU JOUR</Text>
              <Text style={styles.dailyThemeBadge}>{currentDailyVerse.theme}</Text>
            </View>

            <View style={styles.dailyBodyRow}>
              {/* Croix Dorée Lumineuse */}
              <View style={styles.crossGlowContainer}>
                <View style={[styles.crossVertical, { backgroundColor: theme.colors.gold }]} />
                <View style={[styles.crossHorizontal, { backgroundColor: theme.colors.gold }]} />
              </View>

              {/* Texte du Verset & Référence */}
              <View style={styles.verseTextContainer}>
                <Text style={[styles.verseQuote, { color: theme.colors.textPrimary }]}>{currentDailyVerse.verse}</Text>
                <Text style={[styles.verseRef, { color: theme.colors.textMuted }]}>{currentDailyVerse.ref}</Text>
              </View>
            </View>

            {/* Raccordement au Chant Recommandé */}
            <View style={[styles.dailyFooterRow, { borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recommendedLabel, { color: theme.colors.textSecondary }]}>Chant recommandé pour prier :</Text>
                <Text style={[styles.recommendedTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  🎵 {featuredSong.title} • {featuredSong.duration}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.meditateBtn, { backgroundColor: theme.colors.gold }]}
                onPress={handlePlayFeaturedMeditate}
                activeOpacity={0.85}
              >
                <Play size={14} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 2 }} />
                <Text style={styles.meditateBtnText}>Méditer</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ========================================================= */}
        {/* 3. FILTRES D'ATMOSPHÈRE SPIRITUELLE (PILLS DORÉES) */}
        {/* ========================================================= */}
        <Text style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}>Filtrer par atmosphère</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {[
            { id: 'all', label: '✨ Tout voir' },
            { id: 'adoration', label: '🕊️ Adoration Profonde' },
            { id: 'victory', label: '🔥 Combat & Victoire' },
            { id: 'teachings', label: '📖 Enseignements' },
            { id: 'clips', label: '🎬 Clips Vidéo HD' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                activeCategory === tab.id && { backgroundColor: isDarkMode ? 'rgba(197, 155, 39, 0.2)' : 'rgba(197, 155, 39, 0.15)', borderColor: theme.colors.gold },
              ]}
              onPress={() => setActiveCategory(tab.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: theme.colors.textSecondary },
                  activeCategory === tab.id && { color: theme.colors.gold, fontWeight: '800' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ========================================================= */}
        {/* 4. DISCOGRAPHIE & ALBUMS (GRANDS VISUELS AVEC BOUTON PLAY) */}
        {/* ========================================================= */}
        {(activeCategory === 'all' || activeCategory === 'adoration' || activeCategory === 'victory') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Discographie du Chantre</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Albums & Opus prophétiques en streaming VIP</Text>
              </View>
              <Text style={[styles.countBadge, { color: theme.colors.gold }]}>{albums.length} albums</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsHorizontalScroll}
            >
              {albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumCard}
                  onPress={async () => {
                    const allowed = await checkVipAccess();
                    if (allowed) onSelectAlbum(album);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={[styles.albumCoverWrapper, { borderColor: theme.colors.border }]}>
                    <Image source={{ uri: album.cover }} style={styles.albumCover} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.albumCoverGradient}
                    />
                    <View style={[styles.playButtonCircle, { backgroundColor: theme.colors.gold }]}>
                      <Play size={20} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 3 }} />
                    </View>
                  </View>
                  <Text style={[styles.albumTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{album.title}</Text>
                  <Text style={[styles.albumMeta, { color: theme.colors.textMuted }]}>{album.year} • {album.tracks?.length || 10} titres</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ========================================================= */}
        {/* 5. ENSEIGNEMENTS & PODCASTS AUDIO / VIDÉO */}
        {/* ========================================================= */}
        {(activeCategory === 'all' || activeCategory === 'teachings') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Enseignements & Méditations</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Paroles d'édification & prières guidées</Text>
              </View>
            </View>

            <View style={styles.teachingsList}>
              {teachings.map((teaching) => (
                <TouchableOpacity
                  key={teaching.id}
                  style={[styles.teachingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => handleTeachingPress(teaching)}
                  activeOpacity={0.85}
                >
                  <View style={styles.teachingThumbWrapper}>
                    <Image
                      source={{ uri: teaching.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' }}
                      style={styles.teachingThumb}
                    />
                    <View style={styles.mediaTypeBadge}>
                      {teaching.type === 'video' || teaching.category === 'teaching_video' ? (
                        <Film size={11} color="#FFFFFF" />
                      ) : (
                        <BookOpen size={11} color="#FFFFFF" />
                      )}
                      <Text style={styles.mediaTypeBadgeText}>
                        {teaching.type === 'video' || teaching.category === 'teaching_video' ? 'Vidéo' : 'Audio'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teachingInfo}>
                    <Text style={[styles.teachingTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>{teaching.title}</Text>
                    <Text style={[styles.teachingMeta, { color: theme.colors.textMuted }]}>
                      ⏱️ {teaching.duration || '20 min'} • {teaching.speaker_or_artist || 'Chantre Boniface'}
                    </Text>
                  </View>

                  <View style={[styles.playMiniBtn, { backgroundColor: 'rgba(197, 155, 39, 0.12)' }]}>
                    <Play size={14} color={theme.colors.gold} fill={theme.colors.gold} style={{ marginLeft: 2 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* 6. DERNIERS CLIPS VIDÉOS HD */}
        {/* ========================================================= */}
        {(activeCategory === 'all' || activeCategory === 'clips') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Clips Vidéos HD & 4K</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Mises en scène et concerts officiels</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.clipsHorizontalScroll}
            >
              {clips.map((clip) => (
                <TouchableOpacity
                  key={clip.id}
                  style={styles.clipCard}
                  onPress={async () => {
                    const allowed = await checkVipAccess();
                    if (allowed) onSelectClip(clip);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={[styles.clipThumbWrapper, { borderColor: theme.colors.border }]}>
                    <Image source={{ uri: clip.thumbnail }} style={styles.clipThumb} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.clipGradient}
                    />
                    <View style={styles.clipBadge}>
                      <Text style={styles.clipBadgeText}>HD 4K</Text>
                    </View>
                    <View style={[styles.clipPlayBtn, { backgroundColor: theme.colors.gold }]}>
                      <Play size={18} color="#0D0D0D" fill="#0D0D0D" style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  <Text style={[styles.clipTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{clip.title}</Text>
                  <Text style={[styles.clipDuration, { color: theme.colors.textMuted }]}>⏱️ {clip.duration || '04:30'} • Chantre Boniface</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DES NOTIFICATIONS */}
      <NotificationsModal
        visible={isNotifModalVisible}
        onClose={() => setIsNotifModalVisible(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDeleteNotification}
        onAction={handleNavigateAction}
      />

      {/* MODAL DE RECHERCHE */}
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
          handleTeachingPress(teaching);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  /* HEADER ROYAL */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: 'serif',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: THEME.colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inviteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteHeaderBtnText: {
    color: '#0D0D0D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  /* CARTE "VERSET & CANTIQUE DU JOUR" */
  dailyCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.35)',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  dailyCardGradient: {
    padding: 18,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dailyCardTag: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dailyThemeBadge: {
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
    color: '#F3D068',
    fontSize: 10.5,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(197, 155, 39, 0.3)',
  },
  dailyBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  crossGlowContainer: {
    width: 36,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossVertical: {
    position: 'absolute',
    width: 6,
    height: 44,
    backgroundColor: THEME.colors.gold,
    borderRadius: 3,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 30,
    height: 6,
    top: 14,
    backgroundColor: THEME.colors.gold,
    borderRadius: 3,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  verseTextContainer: {
    flex: 1,
  },
  verseQuote: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 20,
    fontWeight: '500',
  },
  verseRef: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 4,
  },
  dailyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  recommendedLabel: {
    color: '#9CA3AF',
    fontSize: 10.5,
    fontWeight: '500',
  },
  recommendedTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 1,
  },
  meditateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  meditateBtnText: {
    color: '#0D0D0D',
    fontSize: 12,
    fontWeight: '800',
  },

  /* FILTRES D'ATMOSPHÈRE */
  filterSectionTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  filterPillsScroll: {
    gap: 8,
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(197, 155, 39, 0.2)',
    borderColor: THEME.colors.gold,
  },
  filterPillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: THEME.colors.gold,
    fontWeight: '800',
  },

  /* SECTIONS GÉNÉRALES */
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 11.5,
    marginTop: 2,
  },
  countBadge: {
    color: THEME.colors.gold,
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* DISCOGRAPHIE / ALBUMS */
  albumsHorizontalScroll: {
    gap: 14,
  },
  albumCard: {
    width: 155,
  },
  albumCoverWrapper: {
    width: 155,
    height: 155,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  albumCover: {
    width: '100%',
    height: '100%',
  },
  albumCoverGradient: {
    position: 'absolute',
    inset: 0,
  },
  playButtonCircle: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 8,
  },
  albumMeta: {
    color: '#6B7280',
    fontSize: 11.5,
    marginTop: 1,
  },

  /* ENSEIGNEMENTS / PODCASTS */
  teachingsList: {
    gap: 10,
  },
  teachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
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
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  mediaTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  teachingInfo: {
    flex: 1,
  },
  teachingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  teachingMeta: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },
  playMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* CLIPS VIDÉOS */
  clipsHorizontalScroll: {
    gap: 14,
  },
  clipCard: {
    width: 220,
  },
  clipThumbWrapper: {
    width: 220,
    height: 125,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  clipThumb: {
    width: '100%',
    height: '100%',
  },
  clipGradient: {
    position: 'absolute',
    inset: 0,
  },
  clipBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  clipBadgeText: {
    color: '#F3D068',
    fontSize: 9.5,
    fontWeight: '800',
  },
  clipPlayBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  clipTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  clipDuration: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 1,
  },
});
