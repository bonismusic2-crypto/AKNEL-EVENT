import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const PaywallScreen = ({ onBack, onSuccess }) => {
  const benefits = [
    'Accès illimité à tous les albums et singles audio.',
    'Clips vidéo officiels en qualité HD.',
    'Enseignements et prédications audio & vidéo exclusifs.',
    'Écoute en arrière-plan (écran verrouillé).',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Titre Principal */}
        <Text style={styles.title}>Accédez à tout l'univers du{'\n'}Chantre Boniface</Text>

        {/* Carte Tarifaire Dorée - Premium VIP */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF5']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.vipTag}>👑 PREMIUM VIP</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceEuro}>2 €</Text>
                <Text style={styles.perMonth}> / mois</Text>
              </View>
              <Text style={styles.priceFcfa}>= 1 300 FCFA / mois</Text>
              <Text style={styles.noCommitment}>Sans engagement • Annulable à tout moment</Text>
            </View>

            {/* Liste des Avantages */}
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.checkCircle}>
                    <Check size={14} color={THEME.colors.gold} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Section Paiement Sécurisé GeniusPay */}
            <View style={styles.paymentSection}>
              <Text style={styles.paymentNote}>Paiement sécurisé via GeniusPay</Text>
              <View style={styles.paymentLogosRow}>
                <View style={[styles.badgeLogo, { backgroundColor: '#1BA4E8' }]}>
                  <Text style={styles.badgeText}>Wave</Text>
                </View>
                <View style={[styles.badgeLogo, { backgroundColor: '#FF6600' }]}>
                  <Text style={styles.badgeText}>Orange</Text>
                </View>
                <View style={[styles.badgeLogo, { backgroundColor: '#FFCC00' }]}>
                  <Text style={[styles.badgeText, { color: '#000' }]}>MTN</Text>
                </View>
                <View style={[styles.badgeLogo, { backgroundColor: '#004F9F' }]}>
                  <Text style={styles.badgeText}>Moov</Text>
                </View>
                <View style={[styles.badgeLogo, { backgroundColor: '#1A1F71' }]}>
                  <Text style={styles.badgeText}>VISA</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bouton S'abonner maintenant */}
        <TouchableOpacity style={styles.ctaBtn} onPress={onSuccess} activeOpacity={0.85}>
          <LinearGradient
            colors={THEME.colors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>S'abonner maintenant</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Lien Déjà Abonné */}
        <TouchableOpacity style={styles.restoreBtn} onPress={onBack}>
          <Text style={styles.restoreText}>Déjà abonné ? <Text style={styles.restoreLink}>Se connecter</Text></Text>
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
  },
  header: {
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
    alignSelf: 'flex-start',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 32,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    marginBottom: 24,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 20,
  },
  vipTag: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceEuro: {
    color: THEME.colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
  },
  perMonth: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  priceFcfa: {
    color: THEME.colors.gold,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  noCommitment: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  benefitsList: {
    gap: 14,
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  paymentSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  paymentNote: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginBottom: 10,
  },
  paymentLogosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeLogo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ctaBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  restoreBtn: {
    alignItems: 'center',
  },
  restoreText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  restoreLink: {
    color: THEME.colors.gold,
    fontWeight: '700',
  },
});
