import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sliders, Volume2, Wifi, Moon, Bell, Trash2, CheckCircle2 } from 'lucide-react-native';
import { THEME, useAppTheme } from '../constants/theme';

export const SettingsScreen = ({ onBack }) => {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const [streamingQuality, setStreamingQuality] = useState('hd'); // 'standard', 'hd'
  const [wifiOnly, setWifiOnly] = useState(false);
  const [evangelizationNotifs, setEvangelizationNotifs] = useState(true);
  const [cacheSize, setCacheSize] = useState('12.4 Mo');

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache audio',
      'Souhaitez-vous libérer l\'espace temporaire occupé par les morceaux en mémoire tampon ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => {
            setCacheSize('0 Mo');
            Alert.alert('Cache libéré', 'Le cache audio temporaire a été nettoyé avec succès.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* 1. Header Natif avec Bouton Retour */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Paramètres & Audio</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>Préférences de streaming et stockage</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Section 1 : Qualité Audio & Vidéo */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>QUALITÉ AUDIO & STREAMING</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(197, 155, 39, 0.12)' }]}>
              <Volume2 size={18} color={theme.colors.gold} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Haute Définition (HD 320 kbps)</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Son cristallin et immersif pour les cantiques et enseignements
              </Text>
            </View>
            <Switch
              value={streamingQuality === 'hd'}
              onValueChange={(val) => setStreamingQuality(val ? 'hd' : 'standard')}
              trackColor={{ false: '#D1D5DB', true: theme.colors.gold }}
            />
          </View>
        </View>

        {/* Section 2 : Données Mobiles & Wi-Fi */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>RÉSEAU & DONNÉES MOBILES</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Wifi size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Télécharger en Wi-Fi uniquement</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Économise votre forfait Internet Mobile Money
              </Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#D1D5DB', true: theme.colors.gold }}
            />
          </View>
        </View>

        {/* Section 3 : Apparence & Thème */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>APPARENCE & THÈME</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
              <Moon size={18} color="#A855F7" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Mode Sombre (Dark Mode)</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Design noir profond élégant et reposant pour les yeux
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: theme.colors.gold }}
            />
          </View>
        </View>

        {/* Section 4 : Notifications */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>NOTIFICATIONS & ALERTES</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Bell size={18} color="#10B981" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Sorties d'albums & Concerts</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Recevez une notification dès la sortie d'un nouvel opus
              </Text>
            </View>
            <Switch
              value={evangelizationNotifs}
              onValueChange={setEvangelizationNotifs}
              trackColor={{ false: '#D1D5DB', true: theme.colors.gold }}
            />
          </View>
        </View>

        {/* Section 5 : Stockage Local & Cache */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>STOCKAGE & CACHE</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Trash2 size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Vider le cache temporaire</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Espace occupé en mémoire : <Text style={{ fontWeight: '700', color: theme.colors.gold }}>{cacheSize}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: theme.colors.border }]}
              onPress={handleClearCache}
              activeOpacity={0.75}
            >
              <Text style={styles.clearBtnText}>Vider</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
});
