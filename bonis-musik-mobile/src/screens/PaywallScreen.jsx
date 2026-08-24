import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SubscriptionService } from '../services/subscriptionService';

export const PaywallScreen = ({ onBack, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);

  const benefits = [
    'Accès illimité à tous les albums et singles audio.',
    'Clips vidéo officiels en qualité HD & 4K.',
    'Enseignements et prédications audio & vidéo exclusifs.',
    'Écoute et visionnage hors-ligne (stockage in-app chiffré).',
    'Écoute en arrière-plan (écran verrouillé).',
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        await SubscriptionService.activateVipSubscription(currentUser);
      }
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          '🎉 Félicitations !',
          'Votre abonnement Premium VIP (2 € / mois) est désormais actif. Profitez pleinement de tout le catalogue.',
          [{ text: 'Accéder à la musique', onPress: onSuccess }]
        );
      }, 1000);
    } catch (err) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de valider la transaction pour le moment.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <X size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.secureHeaderBadge}>
            <ShieldCheck size={16} color={THEME.colors.gold} />
            <Text style={styles.secureHeaderText}>Paiement 100% Sécurisé</Text>
          </View>
        </View>

        {/* Titre Principal */}
        <Text style={styles.title}>Accédez à tout l'univers du{'\n'}Chantre Boniface</Text>
        <Text style={styles.subtitle}>
          Soutenez le ministère et écoutez sans interruption toutes les louanges, adorations et enseignements.
        </Text>

        {/* Carte Tarifaire Dorée - Premium VIP */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF5']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.vipTagContainer}>
                <Sparkles size={14} color={THEME.colors.gold} />
                <Text style={styles.vipTag}>OFFRE PRIVILÈGE VIP</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceEuro}>2 €</Text>
                <Text style={styles.perMonth}> / mois</Text>
              </View>
              <Text style={styles.priceFcfa}>≈ 1 300 FCFA / mois</Text>
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
              <Text style={styles.paymentNote}>Moyens de paiement acceptés (Afrique & International) :</Text>
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
                  <Text style={styles.badgeText}>VISA / MC</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bouton S'abonner maintenant */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={THEME.colors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.ctaText}>S'abonner pour 2 € / mois</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Lien Continuer en mode découverte */}
        <TouchableOpacity style={styles.skipBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.skipText}>Continuer vers l'application en mode Découverte</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secureHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(197, 155, 39, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.25)',
  },
  secureHeaderText: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 30,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: THEME.colors.gold,
    marginBottom: 20,
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
    marginBottom: 18,
  },
  vipTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  vipTag: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceEuro: {
    color: THEME.colors.textPrimary,
    fontSize: 38,
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
    gap: 12,
    marginBottom: 18,
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
    paddingTop: 14,
  },
  paymentNote: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginBottom: 10,
  },
  paymentLogosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
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
    marginBottom: 14,
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
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
