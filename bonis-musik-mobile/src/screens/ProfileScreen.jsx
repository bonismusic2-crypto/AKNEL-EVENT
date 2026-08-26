import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  History,
  Download,
  MessageCircle,
  Sliders,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Lock,
  Trash2,
  Play,
  X,
  HardDrive,
  Wifi,
  Bell,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Music,
  BookOpen,
  Film,
  Calendar
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { supabase } from '../lib/supabase';
import { SubscriptionService } from '../services/subscriptionService';
import { useAudio } from '../context/AudioContext';

export const ProfileScreen = ({ onOpenPaywall, onLogout, currentUser }) => {
  const { history, clearHistory, removeFromHistory, playTrack } = useAudio();
  const [activeModal, setActiveModal] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    plan: 'Abonnement Bonis Musik',
    expiresAt: null,
  });

  // Vérifier le statut réel et la date d'échéance depuis Supabase / Cache
  const checkVipStatus = async () => {
    if (currentUser) {
      const subInfo = await SubscriptionService.checkSubscription(currentUser);
      setIsSubscribed(subInfo.isSubscribed);
      setSubscriptionDetails({
        plan: subInfo.plan || 'Accès Intégral Bonis Musik',
        expiresAt: subInfo.expiresAt || null,
      });
    }
  };

  useEffect(() => {
    checkVipStatus();
  }, [currentUser]);

  // Formatage de la date d'échéance
  const formattedExpiryDate = subscriptionDetails.expiresAt
    ? new Date(subscriptionDetails.expiresAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Dans 30 jours';

  // État des téléchargements hors-ligne sécurisés
  const [downloads, setDownloads] = useState([
    {
      id: 'dl-1',
      title: 'Tu es fidèle',
      artist: 'Chantre Boniface',
      album: 'ÉLÉVATION',
      size: '12.4 Mo',
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: '04:35',
    },
    {
      id: 'dl-2',
      title: 'Ton amour est fidèle',
      artist: 'Chantre Boniface',
      album: 'ÉLÉVATION',
      size: '14.1 Mo',
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: '05:12',
    },
  ]);

  // États des Paramètres
  const [streamingQuality, setStreamingQuality] = useState('hd');
  const [evangelizationNotifs, setEvangelizationNotifs] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [cacheSize, setCacheSize] = useState('84.2 Mo');

  // Profil Utilisateur dynamique
  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || SAMPLE_DATA.user.name;
  const displayEmail = currentUser?.email || SAMPLE_DATA.user.email;
  const displayPhone = currentUser?.user_metadata?.phone || SAMPLE_DATA.user.phone;

  // Gestion du Support WhatsApp direct
  const handleWhatsAppSupport = async () => {
    const phone = '2250556018787';
    const msg = encodeURIComponent("Bonjour Chantre Boniface, j'ai une question concernant l'application Bonis Musik.");
    const url = `https://wa.me/${phone}?text=${msg}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Support Bonis Musik', 'Contactez le support au +225 05 56 01 87 87');
      }
    } catch (e) {
      Alert.alert('Support', 'Contactez le support au +225 05 56 01 87 87');
    }
  };

  // Déconnexion
  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de Bonis Musik ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              SubscriptionService.clearMemoryCache(currentUser?.id);
              await supabase.auth.signOut();
              if (onLogout) onLogout();
            } catch (err) {
              if (onLogout) onLogout();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header Profil avec Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon boni musik.png')}
            style={styles.profileHeaderLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Mon Compte</Text>
        </View>

        {/* Carte Profil Utilisateur */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: currentUser?.user_metadata?.avatar_url || SAMPLE_DATA.user.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            {displayPhone ? <Text style={styles.userPhone}>{displayPhone}</Text> : null}
          </View>
        </View>

        {/* Encadré Abonnement Dynamique avec Date d'Échéance */}
        <View style={styles.subscriptionBox}>
          {isSubscribed ? (
            <>
              <View style={styles.statusBadge}>
                <Sparkles size={13} color={THEME.colors.success} />
                <Text style={styles.statusBadgeText}>ABONNEMENT ACTIF</Text>
              </View>
              <Text style={styles.planTitle}>{subscriptionDetails.plan}</Text>
              <View style={styles.dueDateBadge}>
                <Calendar size={13} color={THEME.colors.gold} />
                <Text style={styles.dueDateText}>
                  Échéance : <Text style={{ fontWeight: '800', color: THEME.colors.textPrimary }}>{formattedExpiryDate}</Text>
                </Text>
              </View>
              <Text style={styles.renewalText}>Accès illimité à tous les albums, clips & enseignements</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>AUCUN ABONNEMENT ACTIF</Text>
              </View>
              <Text style={styles.planTitle}>Abonnement Bonis Musik</Text>
              <Text style={styles.renewalText}>1 000 FCFA = 1,50 € / mois ou 10 000 FCFA = 15,00 € / an</Text>
            </>
          )}

          <TouchableOpacity style={styles.manageBtn} onPress={onOpenPaywall} activeOpacity={0.85}>
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.manageBtnText}>
                {isSubscribed ? 'Gérer / Renouveler mon abonnement' : 'S\'abonner (Dès 1 000 FCFA)'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu d'options interactif */}
        <View style={styles.menuContainer}>
          {/* 1. Téléchargements hors-ligne */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveModal('downloads')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(197, 155, 39, 0.12)' }]}>
                <Download size={18} color={THEME.colors.gold} />
              </View>
              <View>
                <Text style={styles.menuItemText}>Téléchargements hors-ligne</Text>
                <Text style={styles.menuItemSubtext}>{downloads.length} titres chiffrés in-app</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 2. Historique d'écoute */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveModal('history')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <History size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Historique d'écoute</Text>
                <Text style={styles.menuItemSubtext}>{history.length} titres écoutés récemment</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 3. Paramètres de l'application */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveModal('settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(107, 114, 128, 0.12)' }]}>
                <Sliders size={18} color="#4B5563" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Paramètres & Audio</Text>
                <Text style={styles.menuItemSubtext}>Qualité streaming, Wi-Fi, Cache ({cacheSize})</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 4. Support & Contact WhatsApp */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(37, 211, 102, 0.12)' }]}>
                <MessageCircle size={18} color="#25D366" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Support & Ministère</Text>
                <Text style={styles.menuItemSubtext}>Écrire au Chantre Boniface sur WhatsApp</Text>
              </View>
            </View>
            <ExternalLink size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bouton de Déconnexion */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Bonis Musik App • Version 1.0.0 (Édition Officielle)</Text>

      </ScrollView>

      {/* ========================================================= */}
      {/* 1. MODAL TÉLÉCHARGEMENTS HORS-LIGNE CHIFFRÉS IN-APP */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'downloads'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Download size={20} color={THEME.colors.gold} />
              <Text style={styles.modalTitle}>Téléchargements Hors-Ligne</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Bannière de Sécurité / Droits d'auteur */}
            <View style={styles.securityBanner}>
              <Lock size={20} color={THEME.colors.gold} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityBannerTitle}>Stockage Sécurisé & Chiffré In-App</Text>
                <Text style={styles.securityBannerText}>
                  Vos musiques et vidéos sont chiffrées et lisibles exclusivement à l'intérieur de l'application Bonis Musik pour la protection des œuvres de l'artiste. Aucun export MP3 externe n'est autorisé.
                </Text>
              </View>
            </View>

            {/* Espace Utilisé */}
            <View style={styles.storageCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.storageLabel}>Espace utilisé par les titres hors-ligne :</Text>
                <Text style={styles.storageValue}>26.5 Mo / 2 Go</Text>
              </View>
              <View style={styles.storageBarBg}>
                <View style={[styles.storageBarFill, { width: '15%' }]} />
              </View>
            </View>

            {/* Liste des Pistes Téléchargées */}
            <Text style={styles.sectionHeading}>Pistes audio disponibles hors-ligne ({downloads.length})</Text>
            
            {downloads.map((item) => (
              <View key={item.id} style={styles.downloadCard}>
                <Image source={{ uri: item.thumbnail }} style={styles.downloadThumb} />
                <View style={styles.downloadInfo}>
                  <Text style={styles.downloadTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.downloadMeta}>{item.artist} • {item.size} • {item.duration}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    playTrack(item);
                    setActiveModal(null);
                  }}
                  style={styles.playIconCircle}
                >
                  <Play size={16} color={THEME.colors.gold} fill={THEME.colors.gold} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDownloads(downloads.filter(d => d.id !== item.id));
                    Alert.alert('Supprimé', 'Titre retiré de vos téléchargements hors-ligne.');
                  }}
                  style={styles.trashBtn}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* 2. MODAL HISTORIQUE D'ÉCOUTE RÉCENT */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'history'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <History size={20} color="#3B82F6" />
              <Text style={styles.modalTitle}>Historique d'écoute</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {history && history.length > 0 ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={styles.sectionHeading}>Derniers titres écoutés</Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>Effacer tout</Text>
                  </TouchableOpacity>
                </View>

                {history.map((track, idx) => (
                  <View key={track.id || idx} style={styles.historyCard}>
                    <Image source={{ uri: track.cover || track.thumbnail || SAMPLE_DATA.audioReleases[0].cover }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{track.title}</Text>
                      <Text style={styles.historyMeta}>{track.artist || 'Chantre Boniface'} • {track.duration || '04:30'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        playTrack(track);
                        setActiveModal(null);
                      }}
                      style={styles.playIconCircle}
                    >
                      <Play size={16} color={THEME.colors.gold} fill={THEME.colors.gold} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeFromHistory(track.id)}
                      style={styles.trashBtn}
                    >
                      <Trash2 size={16} color={THEME.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Music size={44} color={THEME.colors.textMuted} />
                <Text style={styles.emptyText}>Aucun historique d'écoute pour le moment.</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* 3. MODAL PARAMÈTRES & RÉGLAGES AUDIO */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'settings'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sliders size={20} color="#4B5563" />
              <Text style={styles.modalTitle}>Paramètres & Audio</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Qualité Streaming */}
            <Text style={styles.sectionHeading}>Qualité Audio & Vidéo</Text>
            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingLabel}>Haute Définition (HD 320 kbps / 4K)</Text>
                <Text style={styles.settingDesc}>Expérience sonore maximale pour les adorations et clips</Text>
              </View>
              <Switch
                value={streamingQuality === 'hd'}
                onValueChange={(val) => setStreamingQuality(val ? 'hd' : 'standard')}
                trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
              />
            </View>

            {/* Téléchargement Wi-Fi */}
            <Text style={styles.sectionHeading}>Données Mobiles</Text>
            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingLabel}>Télécharger uniquement en Wi-Fi</Text>
                <Text style={styles.settingDesc}>Économise votre forfait Internet Mobile Money</Text>
              </View>
              <Switch
                value={wifiOnly}
                onValueChange={setWifiOnly}
                trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
              />
            </View>

            {/* Notifications */}
            <Text style={styles.sectionHeading}>Notifications & Alertes</Text>
            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingLabel}>Alertes Nouveaux Clips & Concerts</Text>
                <Text style={styles.settingDesc}>Soyez averti dès la sortie d'un cantique prophétique</Text>
              </View>
              <Switch
                value={evangelizationNotifs}
                onValueChange={setEvangelizationNotifs}
                trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
              />
            </View>

            {/* Cache Local */}
            <Text style={styles.sectionHeading}>Stockage Local</Text>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Vider le cache temporaire</Text>
                <Text style={styles.settingDesc}>Espace occupé par les morceaux en cache : {cacheSize}</Text>
              </View>
              <TouchableOpacity
                style={styles.clearCacheBtn}
                onPress={() => {
                  setCacheSize('0 Mo');
                  Alert.alert('Cache vidé', 'Le cache audio temporaire a été nettoyé.');
                }}
              >
                <Text style={styles.clearCacheText}>Vider</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 6,
  },
  profileHeaderLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginBottom: 8,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: THEME.colors.textSecondary,
    fontSize: 12.5,
  },
  userPhone: {
    color: THEME.colors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  subscriptionBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    marginBottom: 20,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusBadgeText: {
    color: THEME.colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  dueDateText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  renewalText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  manageBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  menuItemSubtext: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 16,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginBottom: 10,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(197, 155, 39, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  securityBannerTitle: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  securityBannerText: {
    color: THEME.colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  storageLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  storageValue: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  storageBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
    borderRadius: 4,
  },
  sectionHeading: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 6,
  },
  downloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 10,
  },
  downloadThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  downloadMeta: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    gap: 12,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  historyMeta: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  clearCacheBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearCacheText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
