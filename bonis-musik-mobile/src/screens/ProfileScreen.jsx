import React, { useState } from 'react';
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
  Film
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { supabase } from '../lib/supabase';
import { useAudio } from '../context/AudioContext';

export const ProfileScreen = ({ onOpenPaywall, onLogout, currentUser }) => {
  const { history, clearHistory, removeFromHistory, playTrack } = useAudio();

  // État des modales actives : 'downloads' | 'history' | 'settings' | null
  const [activeModal, setActiveModal] = useState(null);

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
      duration: '04:25',
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
    {
      id: 'dl-3',
      title: 'La puissance de la louange prophétique',
      artist: 'Chantre Boniface',
      album: 'Enseignement',
      size: '42.8 Mo',
      type: 'teaching',
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      duration: '45 min',
    },
    {
      id: 'dl-4',
      title: 'Jésus règne à jamais (Clip Officiel)',
      artist: 'Chantre Boniface',
      album: 'Clip Vidéo HD',
      size: '115.0 Mo',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=600',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '05:12',
    },
  ]);

  // États des Paramètres
  const [streamingQuality, setStreamingQuality] = useState('hd'); // 'hd', 'standard', 'eco'
  const [evangelizationNotifs, setEvangelizationNotifs] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('light'); // 'light', 'dark', 'system'
  const [cacheSize, setCacheSize] = useState('84.2 Mo');

  // Profil Utilisateur dynamique
  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || SAMPLE_DATA.user.name;
  const displayEmail = currentUser?.email || SAMPLE_DATA.user.email;
  const displayPhone = currentUser?.user_metadata?.phone || SAMPLE_DATA.user.phone;

  // Gestion du Support WhatsApp direct
  const handleWhatsAppSupport = async () => {
    const phone = '2250700000000';
    const msg = encodeURIComponent("Bonjour Chantre Boniface, j'ai une question concernant l'application Bonis Musik.");
    const url = `https://wa.me/${phone}?text=${msg}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Support Bonis Musik',
          `Vous pouvez joindre notre équipe par WhatsApp ou téléphone au :\n+225 07 00 00 00 00`
        );
      }
    } catch (err) {
      Alert.alert('Support Bonis Musik', 'Contactez le support au +225 07 00 00 00 00');
    }
  };

  // Suppression d'un téléchargement
  const handleDeleteDownload = (id) => {
    Alert.alert(
      'Supprimer le téléchargement',
      'Voulez-vous supprimer ce titre de votre espace hors-ligne chiffré ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setDownloads((prev) => prev.filter((d) => d.id !== id));
          },
        },
      ]
    );
  };

  // Vider tous les téléchargements
  const handleClearAllDownloads = () => {
    Alert.alert(
      'Supprimer tous les téléchargements',
      'Tous les fichiers hors-ligne chiffrés seront supprimés de cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
            setDownloads([]);
          },
        },
      ]
    );
  };

  // Vider le cache
  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Voulez-vous libérer les données temporaires de navigation et de lecture ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider le cache',
          onPress: () => {
            setCacheSize('0 Ko');
            Alert.alert('Cache vidé', 'Le cache a été vidé avec succès. 84 Mo libérés.');
          },
        },
      ]
    );
  };

  // Déconnexion
  const handleLogoutPress = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Récemment";
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header Profil */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setActiveModal('settings')}
            activeOpacity={0.7}
          >
            <Settings size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Info Utilisateur Connecté */}
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

        {/* Encadré Abonnement Actif - Premium VIP */}
        <View style={styles.subscriptionBox}>
          <View style={styles.statusBadge}>
            <Sparkles size={13} color={THEME.colors.success} />
            <Text style={styles.statusBadgeText}>ABONNEMENT VIP ACTIF</Text>
          </View>
          <Text style={styles.planTitle}>Abonnement VIP 2 € / mois</Text>
          <Text style={styles.renewalText}>Prochain renouvellement : le 24 Septembre 2026</Text>

          <TouchableOpacity style={styles.manageBtn} onPress={onOpenPaywall} activeOpacity={0.85}>
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.manageBtnText}>Gérer mon abonnement</Text>
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
                <Text style={styles.menuItemSubText}>{downloads.length} titres & vidéos chiffrés</Text>
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
                <Text style={styles.menuItemSubText}>{history.length} titres & enseignements écoutés</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 3. Support WhatsApp */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <MessageCircle size={18} color="#25D366" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Support / Contact WhatsApp</Text>
                <Text style={styles.menuItemSubText}>Assistance 7j/7 avec le ministère</Text>
              </View>
            </View>
            <ExternalLink size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 4. Paramètres */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveModal('settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(107, 114, 128, 0.12)' }]}>
                <Sliders size={18} color={THEME.colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.menuItemText}>Paramètres</Text>
                <Text style={styles.menuItemSubText}>Qualité audio, notifications, cache</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* Déconnexion */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
                <LogOut size={18} color={THEME.colors.danger} />
              </View>
              <Text style={[styles.menuItemText, { color: THEME.colors.danger }]}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1 : TÉLÉCHARGEMENTS HORS-LIGNE CHIFFRÉS */}
      {/* ========================================================================= */}
      <Modal
        visible={activeModal === 'downloads'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Téléchargements hors-ligne</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeModalBtn}>
              <X size={22} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Banner de Sécurité et Chiffrement In-App */}
            <View style={styles.securityWarningCard}>
              <View style={styles.securityWarningHeader}>
                <Lock size={20} color="#D97706" />
                <Text style={styles.securityWarningTitle}>Stockage Sécurisé In-App</Text>
              </View>
              <Text style={styles.securityWarningText}>
                🔒 Stockage Sécurisé In-App : Vos musiques et vidéos téléchargées sont chiffrées et lisibles exclusivement dans Bonis Musik (protection des droits d'auteur, aucun export MP3/MP4 externe autorisé).
              </Text>
              <View style={styles.encryptionBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.encryptionBadgeText}>Chiffrement local AES-256 in-app actif</Text>
              </View>
            </View>

            {/* Jauge d'espace de stockage */}
            <View style={styles.storageGaugeCard}>
              <View style={styles.storageHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <HardDrive size={18} color={THEME.colors.textSecondary} />
                  <Text style={styles.storageTitle}>Espace utilisé</Text>
                </View>
                {downloads.length > 0 && (
                  <TouchableOpacity onPress={handleClearAllDownloads}>
                    <Text style={styles.clearAllText}>Tout effacer</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.storageAmount}>184.3 Mo / 4 fichiers hors-ligne</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '25%' }]} />
              </View>
              <Text style={styles.storageSubText}>Disponible pour l'écoute sans connexion Internet</Text>
            </View>

            {/* Liste des Téléchargements */}
            <Text style={styles.sectionSubtitle}>Titres & Vidéos disponibles ({downloads.length})</Text>

            {downloads.length === 0 ? (
              <View style={styles.emptyState}>
                <Download size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>Aucun téléchargement</Text>
                <Text style={styles.emptySub}>Vos musiques et enseignements téléchargés apparaîtront ici pour une écoute sans connexion.</Text>
              </View>
            ) : (
              <View style={styles.downloadsList}>
                {downloads.map((item) => (
                  <View key={item.id} style={styles.downloadItem}>
                    <Image source={{ uri: item.thumbnail }} style={styles.downloadThumb} />
                    <View style={styles.downloadInfo}>
                      <Text style={styles.downloadTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.downloadMeta}>
                        {item.type === 'video' ? '🎬 Vidéo' : item.type === 'teaching' ? '📖 Enseignement' : '🎵 Audio'} • {item.size}
                      </Text>
                    </View>
                    <View style={styles.downloadActions}>
                      <TouchableOpacity
                        style={styles.playMiniCircle}
                        onPress={() => {
                          playTrack({
                            id: item.id,
                            title: item.title,
                            artist: item.artist,
                            album: item.album,
                            cover: item.thumbnail,
                            url: item.url,
                            duration: item.duration,
                          });
                        }}
                      >
                        <Play size={14} color={THEME.colors.gold} fill={THEME.colors.gold} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.trashBtn}
                        onPress={() => handleDeleteDownload(item.id)}
                      >
                        <Trash2 size={16} color={THEME.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2 : HISTORIQUE D'ÉCOUTE DYNAMIQUE */}
      {/* ========================================================================= */}
      <Modal
        visible={activeModal === 'history'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historique d'écoute</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {history.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearAllText}>Effacer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeModalBtn}>
                <X size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <History size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>Historique vide</Text>
                <Text style={styles.emptySub}>Les chants et enseignements que vous écouterez s'afficheront ici en temps réel.</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {history.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    style={styles.historyCard}
                    onPress={() => playTrack(item)}
                    activeOpacity={0.75}
                  >
                    <Image source={{ uri: item.cover || item.thumbnail }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyMeta}>
                        {item.artist || 'Chantre Boniface'} • {formatTimeAgo(item.playedAt)}
                      </Text>
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>
                          {item.type === 'teaching' ? '📖 Enseignement' : '🎵 Musique'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.playMiniCircle}>
                      <Play size={15} color={THEME.colors.gold} fill={THEME.colors.gold} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3 : PARAMÈTRES COMPLETS */}
      {/* ========================================================================= */}
      <Modal
        visible={activeModal === 'settings'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Paramètres</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeModalBtn}>
              <X size={22} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            {/* Section 1 : Qualité Audio */}
            <Text style={styles.settingsGroupTitle}>QUALITÉ AUDIO & STREAMING</Text>
            <View style={styles.settingsCard}>
              {[
                { key: 'hd', label: 'Haute Définition (320 kbps)', sub: 'Qualité studio optimale (recommandée)' },
                { key: 'standard', label: 'Standard (192 kbps)', sub: 'Bon équilibre qualité / données' },
                { key: 'eco', label: 'Économie de données (128 kbps)', sub: 'Idéal en connexion faible' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.optionRow}
                  onPress={() => setStreamingQuality(opt.key)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionSub}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.radioCircle, streamingQuality === opt.key && styles.radioCircleActive]}>
                    {streamingQuality === opt.key && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Section 2 : Notifications */}
            <Text style={styles.settingsGroupTitle}>NOTIFICATIONS & ALERTES</Text>
            <View style={styles.settingsCard}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.optionLabel}>Alertes d'évangélisation</Text>
                  <Text style={styles.optionSub}>Recevoir les nouveaux chants, clips et moments de prière</Text>
                </View>
                <Switch
                  value={evangelizationNotifs}
                  onValueChange={setEvangelizationNotifs}
                  trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 3 : Données & Réseau */}
            <Text style={styles.settingsGroupTitle}>RÉSEAU & TÉLÉCHARGEMENTS</Text>
            <View style={styles.settingsCard}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.optionLabel}>Téléchargement en Wi-Fi uniquement</Text>
                  <Text style={styles.optionSub}>Évite d'utiliser le forfait données mobiles</Text>
                </View>
                <Switch
                  value={wifiOnly}
                  onValueChange={setWifiOnly}
                  trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 4 : Apparence & Thème */}
            <Text style={styles.settingsGroupTitle}>APPARENCE</Text>
            <View style={styles.settingsCard}>
              {[
                { key: 'light', label: '☀️ Thème Lumineux (Or & Blanc)' },
                { key: 'dark', label: '🌙 Mode Sombre' },
                { key: 'system', label: '📱 Automatique (Selon le système)' },
              ].map((th) => (
                <TouchableOpacity
                  key={th.key}
                  style={styles.optionRow}
                  onPress={() => setSelectedTheme(th.key)}
                >
                  <Text style={styles.optionLabel}>{th.label}</Text>
                  <View style={[styles.radioCircle, selectedTheme === th.key && styles.radioCircleActive]}>
                    {selectedTheme === th.key && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Section 5 : Gestion du Cache */}
            <Text style={styles.settingsGroupTitle}>ESPACE & STOCKAGE</Text>
            <View style={styles.settingsCard}>
              <View style={styles.cacheRow}>
                <View>
                  <Text style={styles.optionLabel}>Données en cache</Text>
                  <Text style={styles.optionSub}>Taille actuelle : {cacheSize}</Text>
                </View>
                <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
                  <Text style={styles.clearCacheBtnText}>Vider le cache</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Version */}
            <Text style={styles.versionText}>Bonis Musik v1.0.0 • Production 2026</Text>

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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: THEME.colors.gold,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  userPhone: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  subscriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: THEME.colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  renewalText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
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
    fontWeight: '800',
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemSubText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    fontSize: 18,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  securityWarningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  securityWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityWarningTitle: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '800',
  },
  securityWarningText: {
    color: '#78350F',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  encryptionBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  storageGaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  storageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  clearAllText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  storageAmount: {
    color: THEME.colors.gold,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
    borderRadius: 3,
  },
  storageSubText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  sectionSubtitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  downloadsList: {
    gap: 10,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  downloadThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  downloadMeta: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  downloadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playMiniCircle: {
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
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySub: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  historyInfo: {
    flex: 1,
    gap: 3,
  },
  historyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  historyMeta: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197, 155, 39, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  tagBadgeText: {
    color: THEME.colors.gold,
    fontSize: 9.5,
    fontWeight: '700',
  },
  // Settings Styles
  settingsGroupTitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionLabel: {
    color: THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
  },
  optionSub: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: THEME.colors.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.gold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cacheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  clearCacheBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearCacheBtnText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
  },
});
