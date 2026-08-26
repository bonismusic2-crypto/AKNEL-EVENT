import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Play, Sparkles, MoreVertical } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { MediaService } from '../services/mediaService';
import { SubscriptionService } from '../services/subscriptionService';
import { DownloadService } from '../services/downloadService';
import { useAudio } from '../context/AudioContext';
import { NotificationsModal, INITIAL_MOBILE_NOTIFICATIONS } from '../components/NotificationsModal';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';
import { SearchModal } from '../components/SearchModal';

export const HomeScreen = ({
  currentUser,
  onSelectAlbum,
  onSelectClip,
  onSelectTeaching,
  onOpenProfile,
  onOpenPaywall
}) => {
  const { playTrack } = useAudio();
  const [albums, setAlbums] = useState(SAMPLE_DATA.audioReleases);
  const [clips, setClips] = useState(SAMPLE_DATA.videoClips);
  const [teachings, setTeachings] = useState(SAMPLE_DATA.teachings);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_MOBILE_NOTIFICATIONS);
  const [isSubscribed, setIsSubscribed] = useState(
    SubscriptionService.getFastSubscriptionState(currentUser?.id).isSubscribed || false
  );

  // Vérifier le statut VIP réel depuis Supabase / Persistance
  const checkVipStatus = async () => {
    if (currentUser) {
      const sub = await SubscriptionService.isUserSubscribed(currentUser);
      setIsSubscribed(sub);
    }
  };

  useEffect(() => {
    checkVipStatus();
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
        MediaService.getMediaContents('video_clip'),
        MediaService.getMediaContents(null), // Enseignements
        fetchNotifications(),
      ]);

      if (liveAlbums && liveAlbums.length > 0) setAlbums(liveAlbums);
      if (liveClips && liveClips.length > 0) setClips(liveClips);
      if (liveTeachings && liveTeachings.length > 0) {
        const onlyTeachings = liveTeachings.filter(t => t.type === 'audio' || t.type === 'video');
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

  const heroClip = clips[0] || SAMPLE_DATA.videoClips[0];

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.gold} />
        }
      >
        {/* Header avec Profil cliquable & Notification */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: currentUser?.user_metadata?.avatar_url || SAMPLE_DATA.user.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
              {isSubscribed ? (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipText}>✓ Abonné</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={onOpenPaywall} activeOpacity={0.7} style={styles.subscribeBadge}>
                  <Sparkles size={11} color="#FFFFFF" />
                  <Text style={styles.subscribeBadgeText}>S'abonner (1 000 F / mois)</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsNotifModalVisible(true)}
            activeOpacity={0.75}
          >
            <Bell size={20} color={THEME.colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Barre de Recherche Interactive */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setIsSearchModalVisible(true)}
          activeOpacity={0.8}
        >
          <Search size={18} color={THEME.colors.gold} />
          <Text style={styles.searchText}>Rechercher un chant, album, enseignement...</Text>
        </TouchableOpacity>

        {/* Bannière Hero Lumineuse & Dorée Synchronisée */}
        <View style={styles.heroCard}>
          <Image source={{ uri: heroClip.thumbnail }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.4)', '#FFFFFF']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeContainer}>
                <Text style={styles.newClipBadge}>NOUVEAU CLIP</Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>{heroClip.title}</Text>
            <TouchableOpacity
              style={styles.watchBtn}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectClip(heroClip);
              }}
              activeOpacity={0.85}
            >
              <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.watchBtnText}>Regarder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Dernières Sorties Audio Synchronisées */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernières sorties audio</Text>
          <TouchableOpacity onPress={async () => {
            const allowed = await checkVipAccess();
            if (allowed) onSelectClip(heroClip);
          }}>
            <Text style={styles.seeAll}>Voir tout ({albums.length})</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectAlbum(album);
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: album.cover }} style={styles.albumCover} />
              <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
              <Text style={styles.albumYear}>{album.year}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Clips Récents Synchronisés */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clips récents</Text>
          <TouchableOpacity onPress={async () => {
            const allowed = await checkVipAccess();
            if (allowed) onSelectClip(heroClip);
          }}>
            <Text style={styles.seeAll}>Voir tout ({clips.length})</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {clips.map((clip) => (
            <TouchableOpacity
              key={clip.id}
              style={styles.clipCard}
              onPress={async () => {
                const allowed = await checkVipAccess();
                if (allowed) onSelectClip(clip);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.clipThumbnailContainer}>
                <Image source={{ uri: clip.thumbnail }} style={styles.clipThumbnail} />
                <View style={styles.durationTag}>
                  <Text style={styles.durationText}>{clip.duration}</Text>
                </View>
              </View>
              <Text style={styles.clipTitle} numberOfLines={1}>{clip.title}</Text>
              <Text style={styles.clipDate}>{clip.date || 'Récemment'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Enseignements & Prédications Synchronisés */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Enseignements & Prédications</Text>
          <TouchableOpacity onPress={() => onSelectClip(heroClip)}>
            <Text style={styles.seeAll}>Voir tout ({teachings.length})</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.teachingsList}>
          {teachings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.teachingCard}
              onPress={() => handleTeachingPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.teachingLeft}>
                <Image source={{ uri: item.thumbnail }} style={styles.teachingThumbnail} />
                <View style={styles.teachingInfo}>
                  <Text style={styles.teachingTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.teachingMeta}>Chantre Boniface • {item.duration}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.playIconCircle}>
                  <Play size={14} color={THEME.colors.gold} fill={THEME.colors.gold} />
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
          ))}
        </View>

        {/* Modal d'options 3 points */}
        <MediaOptionsMenu
          visible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
          item={selectedMenuItem}
          onPlayDirect={(item) => {
            if (item.type === 'video') {
              onSelectClip(item);
            } else {
              handleTeachingPress(item);
            }
          }}
          onToggleDownload={async (item) => {
            await DownloadService.toggleDownload(item);
          }}
          onToggleFavorite={(item) => {
            Alert.alert('Favoris', `"${item.title}" ajouté à vos favoris.`);
          }}
        />

        {/* Espace pour MiniPlayer en bas */}
        <View style={{ height: 90 }} />

        {/* Modal de Notifications Interactif */}
        <NotificationsModal
          visible={isNotifModalVisible}
          onClose={() => setIsNotifModalVisible(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteNotification={handleDeleteNotification}
          onNavigateAction={handleNavigateAction}
        />

        {/* Modal de Recherche Avancée */}
        <SearchModal
          visible={isSearchModalVisible}
          onClose={() => setIsSearchModalVisible(false)}
          albums={albums}
          clips={clips}
          teachings={teachings}
          onSelectAlbum={onSelectAlbum}
          onSelectClip={onSelectClip}
          onPlayTrack={playTrack}
          onSelectTeaching={handleTeachingPress}
          onOpenOptions={(item) => {
            setSelectedMenuItem(item);
            setIsMenuVisible(true);
          }}
        />

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
    alignSelf: 'flex-start',
  },
  vipText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  subscribeBadge: {
    marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  subscribeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
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
    fontSize: 13,
    flex: 1,
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
    marginBottom: 24,
  },
  albumCard: {
    width: 140,
  },
  albumCover: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontWeight: '700',
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
    marginBottom: 20,
  },
  teachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teachingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  teachingThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  teachingInfo: {
    flex: 1,
  },
  teachingTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  teachingMeta: {
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
    marginLeft: 8,
  },
});
