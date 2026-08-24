import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, ShieldCheck, Sparkles, X, Smartphone, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SubscriptionService } from '../services/subscriptionService';
import { GeniusPayService } from '../services/geniusPayService';

export const PaywallScreen = ({ onBack, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('wave');

  const benefits = [
    'Accès illimité à tous les albums et singles audio.',
    'Clips vidéo officiels en qualité HD & 4K.',
    'Enseignements et prédications audio & vidéo exclusifs.',
    'Écoute et visionnage hors-ligne (stockage in-app chiffré).',
    'Écoute en arrière-plan (écran verrouillé).',
  ];

  const paymentMethods = [
    { id: 'wave', name: 'Wave', color: '#1BA4E8', type: 'Mobile Money' },
    { id: 'orange', name: 'Orange Money', color: '#FF6600', type: 'Mobile Money' },
    { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', textColor: '#000', type: 'Mobile Money' },
    { id: 'moov', name: 'Moov Money', color: '#004F9F', type: 'Mobile Money' },
    { id: 'card', name: 'Carte VISA / Mastercard', color: '#1A1F71', type: 'Carte Bancaire' },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 1. Initialisation Transaction Sandbox GeniusPay
      const paymentResult = await GeniusPayService.createSubscriptionPayment({
        user: currentUser,
        amount: 1300,
        paymentMethod: selectedMethod,
      });

      // 2. Activation de l'abonnement VIP dans Supabase
      if (currentUser) {
        await SubscriptionService.activateVipSubscription(currentUser);
      }

      setLoading(false);
      // Redirection directe vers le nouvel écran PaymentSuccessScreen avec le txId réel
      if (onSuccess) {
        onSuccess(paymentResult.tx_id);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible d\'initialiser le paiement GeniusPay : ' + (err.message || ''));
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
            <Text style={styles.secureHeaderText}>GeniusPay Sandbox Sécurisé</Text>
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
                <Text style={styles.vipTag}>PREMIUM VIP ILLIMITÉ</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceEuro}>2 €</Text>
                <Text style={styles.perMonth}> / mois</Text>
              </View>
              <Text style={styles.priceFcfa}>= 1 300 FCFA / mois</Text>
              <Text style={styles.noCommitment}>Sans engagement • Annulable à tout moment en 1 clic</Text>
            </View>

            {/* Liste des Avantages */}
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.checkCircle}>
                    <Check size={14} color={THEME.colors.gold} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Choix du Moyen de Paiement GeniusPay */}
            <View style={styles.paymentSection}>
              <Text style={styles.paymentNote}>Choisissez votre moyen de paiement :</Text>
              <View style={styles.methodsGrid}>
                {paymentMethods.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.methodCard,
                        isSelected && styles.methodCardSelected,
                      ]}
                      onPress={() => setSelectedMethod(m.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.methodBadge, { backgroundColor: m.color }]}>
                        <Text style={[styles.methodBadgeText, m.textColor ? { color: m.textColor } : {}]}>
                          {m.name}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
              <Text style={styles.ctaText}>Payer 1 300 FCFA (2 €) via GeniusPay</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Note de Réassurance */}
        <Text style={styles.reassuranceText}>
          🔒 Sandbox Test : Vos clés API GeniusPay sont actives et sécurisées.
        </Text>

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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  secureHeaderText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 32,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
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
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  vipTag: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
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
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  noCommitment: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  benefitsList: {
    gap: 12,
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
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  paymentNote: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodCardSelected: {
    borderColor: THEME.colors.gold,
    backgroundColor: '#FFFDF5',
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  reassuranceText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
