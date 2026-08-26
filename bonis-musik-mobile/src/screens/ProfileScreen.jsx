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
  Film
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

  // Vérifier le vrai statut d'abonnement Supabase
  const checkVipStatus = async () => {
    if (currentUser) {
      const sub = await SubscriptionService.isUserSubscribed(currentUser);
      setIsSubscribed(sub);
    }
  };

  useEffect(() => {
    checkVipStatus();
  }, [currentUser]);

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
    } catch (err) {
      Alert.alert('Support Bonis Musik', 'Contactez le support au +225 05 56 01 87 87');
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
            setDownloads(prev => prev.filter(item => item.id !== id));
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

        {/* Encadré Abonnement Dynamique */}
        <View style={styles.subscriptionBox}>
          {isSubscribed ? (
            <>
              <View style={styles.statusBadge}>
                <Sparkles size={13} color={THEME.colors.success} />
                <Text style={styles.statusBadgeText}>ABONNEMENT VIP ACTIF</Text>
              </View>
              <Text style={styles.planTitle}>Abonnement VIP 2 € / mois</Text>
              <Text style={styles.renewalText}>Accès illimité à tout le catalogue</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>AUCUN ABONNEMENT ACTIF</Text>
              </View>
              <Text style={styles.planTitle}>Pass VIP Illimité (2 € / mois)</Text>
              <Text style={styles.renewalText}>Débloquez la musique HD, clips et enseignements</Text>
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
                {isSubscribed ? 'Gérer mon abonnement GeniusPay' : 'S\'abonner maintenant (1 300 FCFA)'}
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
                <Text style={styles.menuItemSubText}>{downloads.length} titres & vidéos chiffrés in-app</Text>
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
                <Text style={styles.menuItemSubText}>{history.length} titres récents</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 3. Paramètres */}
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
                <Text style={styles.menuItemText}>Paramètres & Qualité audio</Text>
                <Text style={styles.menuItemSubText}>HD 320 kbps • Wi-Fi</Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {/* 4. Support WhatsApp */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <MessageCircle size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Assistance & Contact Direct</Text>
                <Text style={styles.menuItemSubText}>WhatsApp officiel</Text>
              </View>
            </View>
            <ExternalLink size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bouton de Déconnexion */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={THEME.colors.error} />
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* MODAL 1 : TÉLÉCHARGEMENTS HORS-LIGNE */}
        <Modal
          visible={activeModal === 'downloads'}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActiveModal(null)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Téléchargements hors-ligne</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.legalNoticeBox}>
                <ShieldCheck size={20} color={THEME.colors.gold} style={{ marginTop: 2 }} />
                <Text style={styles.legalNoticeText}>
                  🔒 <Text style={{ fontWeight: '800' }}>Stockage Sécurisé In-App :</Text> Vos musiques et vidéos sont chiffrées (AES-256) et lisibles exclusivement dans l'application Bonis Musik. Aucun export externe n'est possible.
                </Text>
              </View>

              <View style={styles.downloadsList}>
                {downloads.map((item) => (
                  <View key={item.id} style={styles.downloadCard}>
                    <Image source={{ uri: item.thumbnail }} style={styles.downloadThumb} />
                    <View style={styles.downloadInfo}>
                      <Text style={styles.downloadTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.downloadMeta}>{item.artist} • {item.size}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteDownload(item.id)}
                      style={styles.trashBtn}
                    >
                      <Trash2 size={18} color={THEME.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* MODAL 2 : HISTORIQUE D'ÉCOUTE */}
        <Modal
          visible={activeModal === 'history'}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActiveModal(null)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Historique d'écoute</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {history.length === 0 ? (
                <View style={styles.emptyState}>
                  <History size={48} color={THEME.colors.textMuted} />
                  <Text style={styles.emptyText}>Aucune écoute récente</Text>
                </View>
              ) : (
                history.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.historyCard}
                    onPress={() => {
                      playTrack(item);
                      setActiveModal(null);
                    }}
                  >
                    <Image source={{ uri: item.cover || item.thumbnail }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyMeta}>{item.artist || 'Chantre Boniface'}</Text>
                    </View>
                    <Play size={16} color={THEME.colors.gold} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* MODAL 3 : PARAMÈTRES */}
        <Modal
          visible={activeModal === 'settings'}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActiveModal(null)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paramètres</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Téléchargement Wi-Fi uniquement</Text>
                <Switch
                  value={wifiOnly}
                  onValueChange={setWifiOnly}
                  trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notifications d'évangélisation</Text>
                <Switch
                  value={evangelizationNotifs}
                  onValueChange={setEvangelizationNotifs}
                  trackColor={{ false: '#D1D5DB', true: THEME.colors.gold }}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

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
    paddingBottom: 40,
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
    fontWeight: '900',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: THEME.colors.gold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  userEmail: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  subscriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    marginBottom: 24,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  planTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  renewalText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  manageBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 15,
    borderRadius: 20,
  },
  logoutBtnText: {
    color: THEME.colors.error,
    fontSize: 14,
    fontWeight: '800',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    padding: 20,
  },
  legalNoticeBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(197, 155, 39, 0.1)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.2)',
  },
  legalNoticeText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  downloadsList: {
    gap: 12,
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
  trashBtn: {
    padding: 8,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
});
