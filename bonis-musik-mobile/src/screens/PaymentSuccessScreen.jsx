import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Sparkles, Music, ArrowRight, ShieldCheck, Download, Award, Calendar, QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const PaymentSuccessScreen = ({ txId, onContinue, currentUser }) => {
  const buyerName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Abonné VIP';
  const qrCodeToken = 'VIP-' + (txId || 'BONIS').slice(-8).toUpperCase();
  const renewalDate = '24 Septembre 2026';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Icône de Succès */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={44} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.badgeSuccess}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.badgeSuccessText}>PAIEMENT VALIDÉ PAR GENIUSPAY</Text>
          </View>
          <h1 style={{ display: 'none' }}>Success</h1>
          <Text style={styles.title}>Bienvenue dans le Club VIP !</Text>
          <Text style={styles.subtitle}>
            Votre abonnement mensuel à 2 € (~1 300 FCFA) est actif. Vous avez désormais un accès illimité à tout le catalogue du Chantre Boniface.
          </Text>
        </View>

        {/* CARTE PASS VIP OFFICIEL MOBILE */}
        <View style={styles.vipPassCard}>
          <LinearGradient
            colors={['#111827', '#1F2937', '#111827']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Header du Pass */}
            <View style={styles.passHeader}>
              <View>
                <Text style={styles.brandTitle}>BONIS <Text style={{ color: THEME.colors.gold }}>MUSIK</Text></Text>
                <Text style={styles.brandSubtitle}>PASS STREAMING ILLIMITÉ VIP</Text>
              </View>
              <View style={styles.vipPill}>
                <Award size={12} color={THEME.colors.gold} />
                <Text style={styles.vipPillText}>MEMBRE VIP</Text>
              </View>
            </View>

            {/* Infos Utilisateur & Transaction */}
            <View style={styles.passBody}>
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoLabel}>TITULAIRE</Text>
                  <Text style={styles.infoValue}>{buyerName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.infoLabel}>TARIF</Text>
                  <Text style={[styles.infoValue, { color: THEME.colors.gold }]}>1 300 FCFA / mois</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <View>
                  <Text style={styles.infoLabel}>RENOUVELLEMENT</Text>
                  <Text style={styles.infoValue}>{renewalDate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.infoLabel}>RÉFÉRENCE GENIUSPAY</Text>
                  <Text style={[styles.infoValue, { fontFamily: 'monospace', fontSize: 11 }]}>{txId || 'GP_CONFIRMED'}</Text>
                </View>
              </View>
            </View>

            {/* Footer Pass & Avantages Débloqués */}
            <View style={styles.passFooter}>
              <View style={styles.perkBadge}>
                <Music size={12} color="#10B981" />
                <Text style={styles.perkText}>Audio HD 320k</Text>
              </View>
              <View style={styles.perkBadge}>
                <Download size={12} color="#10B981" />
                <Text style={styles.perkText}>Mode Hors-Ligne In-App</Text>
              </View>
              <View style={styles.perkBadge}>
                <Sparkles size={12} color="#10B981" />
                <Text style={styles.perkText}>Clips 4K & Enseignements</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bouton d'action vers l'accueil */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={THEME.colors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Commencer l'Écoute</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

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
    paddingBottom: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  badgeSuccessText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  vipPassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 14,
    marginBottom: 16,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSubtitle: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197, 155, 39, 0.2)',
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vipPillText: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  passBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  passFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 14,
  },
  perkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perkText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '600',
  },
  ctaBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
