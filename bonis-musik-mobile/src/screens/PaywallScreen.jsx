import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Check, ShieldCheck, Sparkles, X, Smartphone, CreditCard, Lock, Calendar, Music } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { GeniusPayService } from '../services/geniusPayService';
import { SubscriptionService } from '../services/subscriptionService';

export const PaywallScreen = ({ onBack, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' ou 'annual'
  const [selectedMethod, setSelectedMethod] = useState('wave');
  const [showWebview, setShowWebview] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [currentTxId, setCurrentTxId] = useState(null);
  const [webviewLoading, setWebviewLoading] = useState(true);
  const completedRef = useRef(false);

  const benefits = [
    'Accès illimité à tous les albums et singles audio du Chantre Boniface.',
    'Clips vidéo officiels en qualité HD & 4K.',
    'Enseignements et prédications audio & vidéo complets.',
    'Écoute et visionnage hors-ligne (stockage in-app chiffré).',
    'Écoute continue en arrière-plan (écran verrouillé).',
  ];

  const plans = [
    {
      id: 'monthly',
      title: 'Abonnement Mensuel',
      priceFcfa: '1 000 FCFA',
      priceEuro: '~1,50 €',
      period: '/ mois',
      subtitle: 'Sans engagement • Annulable à tout moment',
      badge: null,
      amount: 1000,
    },
    {
      id: 'annual',
      title: 'Abonnement Annuel',
      priceFcfa: '10 000 FCFA',
      priceEuro: '~15,00 €',
      period: '/ an',
      subtitle: 'Accès 1 an complet (Économisez 2 mois)',
      badge: '2 MOIS OFFERTS',
      amount: 10000,
    },
  ];

  const paymentMethods = [
    { id: 'wave', name: 'Wave', color: '#1BA4E8', type: 'Mobile Money' },
    { id: 'orange', name: 'Orange Money', color: '#FF6600', type: 'Mobile Money' },
    { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', textColor: '#000', type: 'Mobile Money' },
    { id: 'moov', name: 'Moov Money', color: '#004F9F', type: 'Mobile Money' },
    { id: 'card', name: 'Carte VISA / Mastercard', color: '#1A1F71', type: 'Carte Bancaire' },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];

  // Helper pour valider et basculer sur l'écran succès
  const completeSuccess = (txId) => {
    if (completedRef.current) return;
    completedRef.current = true;

    const finalTxId = txId || currentTxId || 'GP_' + Date.now().toString().slice(-8);

    // 1. Fermeture immédiate de la modal WebView
    setShowWebview(false);

    // 2. Déclenchement de l'activation Supabase et cache mémoire
    if (currentUser) {
      SubscriptionService.setSubscribedInMemory(
        currentUser.id,
        true,
        currentPlan.title + ` (${currentPlan.priceFcfa} / ${currentPlan.priceEuro})`
      );
      SubscriptionService.activateVipSubscription(currentUser, selectedPlan).catch((err) => {
        console.warn('Erreur activation abonnement en tâche de fond:', err);
      });
    }

    // 3. Bascule vers PaymentSuccessScreen
    if (onSuccess) {
      onSuccess(finalTxId, selectedPlan);
    }
  };

  // Vérification auprès de l'API GeniusPay avant validation manuelle
  const verifyAndComplete = async () => {
    if (!currentTxId) {
      Alert.alert(
        'Transaction introuvable',
        'Veuillez d\'abord finaliser votre paiement sur le guichet GeniusPay.'
      );
      return;
    }

    setVerifying(true);
    try {
      const statusData = await GeniusPayService.checkPaymentStatus(currentTxId);
      setVerifying(false);

      const status = statusData?.data?.status || statusData?.status;
      const isPaid = status === 'successful' || status === 'completed' || status === 'paid' || status === 'approved';

      if (isPaid) {
        completeSuccess(currentTxId);
      } else {
        Alert.alert(
          'Paiement en attente ou non complété',
          `GeniusPay n'a pas encore confirmé la réception de vos ${currentPlan.priceFcfa}. Veuillez terminer la transaction sur le guichet avant de valider.`,
          [
            { text: 'Continuer le paiement', style: 'default' },
            {
              text: 'Annuler',
              style: 'cancel',
              onPress: () => setShowWebview(false),
            }
          ]
        );
      }
    } catch (e) {
      setVerifying(false);
      completeSuccess(currentTxId);
    }
  };

  // 1. Initialiser la transaction et ouvrir le WebView intégré à l'écran
  const handleSubscribe = async () => {
    completedRef.current = false;
    setLoading(true);
    try {
      const paymentResult = await GeniusPayService.createSubscriptionPayment({
        user: currentUser,
        planType: selectedPlan,
        amount: currentPlan.amount,
        paymentMethod: selectedMethod,
      });

      setLoading(false);

      if (!paymentResult || !paymentResult.checkoutUrl) {
        throw new Error("L'API GeniusPay n'a pas retourné l'URL de paiement.");
      }

      setPaymentUrl(paymentResult.checkoutUrl);
      setCurrentTxId(paymentResult.tx_id);
      setShowWebview(true);
      setWebviewLoading(true);
    } catch (err) {
      setLoading(false);
      Alert.alert(
        'Erreur GeniusPay',
        err.message || 'Impossible d\'initialiser le paiement sécurisé. Veuillez réessayer.'
      );
    }
  };

  // 2. Intercepter le succès automatiquement lorsque GeniusPay redirige
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (!url) return;

    if (
      url.includes('payment-success') ||
      url.includes('success') ||
      url.includes('bonismusik://payment-success') ||
      url.includes('/status/success')
    ) {
      completeSuccess(currentTxId);
    } else if (
      url.includes('payment-cancel') ||
      url.includes('cancel') ||
      url.includes('bonismusik://payment-cancel')
    ) {
      setShowWebview(false);
      Alert.alert('Paiement interrompu', 'La transaction n\'a pas été complétée.');
    }
  };

  // Interception anticipée des requêtes WebView
  const handleShouldStartLoadWithRequest = (request) => {
    const url = request.url;
    if (
      url.includes('payment-success') ||
      url.includes('success') ||
      url.includes('bonismusik://payment-success') ||
      url.includes('/status/success')
    ) {
      completeSuccess(currentTxId);
      return false;
    }
    return true;
  };

  // Bouton pour fermer le WebView
  const handleCloseWebview = () => {
    Alert.alert(
      'Fermer le guichet',
      'Voulez-vous fermer le guichet de paiement ?',
      [
        { text: 'Non, continuer', style: 'cancel' },
        { text: 'Fermer', style: 'destructive', onPress: () => setShowWebview(false) }
      ]
    );
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
            <Text style={styles.secureHeaderText}>GeniusPay Sécurisé</Text>
          </View>
        </View>

        {/* Titre Principal */}
        <Text style={styles.title}>Abonnement Bonis Musik</Text>
        <Text style={styles.subtitle}>
          Accédez en illimité à tous les albums, singles, clips et enseignements du Chantre Boniface.
        </Text>

        {/* SÉLECTEUR DE FORFAIT : MENSUEL OU ANNUEL */}
        <View style={styles.plansContainer}>
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(p.id)}
                activeOpacity={0.85}
              >
                {p.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                <View style={styles.planRadioRow}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.planTitle, isSelected && styles.planTitleActive]}>
                    {p.title}
                  </Text>
                </View>

                <View style={styles.planPriceRow}>
                  <Text style={styles.planPriceFcfa}>{p.priceFcfa}</Text>
                  <Text style={styles.planPriceEuro}> ({p.priceEuro})</Text>
                  <Text style={styles.planPeriod}>{p.period}</Text>
                </View>
                <Text style={styles.planSubtitle}>{p.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CARTE DÉTAILLÉE DES AVANTAGES & PAIEMENT */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF5']}
            style={styles.cardGradient}
          >
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
              <Text style={styles.paymentNote}>Moyen de paiement :</Text>
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

        {/* Bouton S'abonner maintenant avec tarif dynamique */}
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
              <Text style={styles.ctaText}>
                S'abonner • {currentPlan.priceFcfa} ({currentPlan.priceEuro}) {currentPlan.period}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Note de Réassurance */}
        <Text style={styles.reassuranceText}>
          🔒 Paiement 100% In-App sécurisé via GeniusPay (Mobile Money & Carte).
        </Text>

      </ScrollView>

      {/* MODAL WEBVIEW INTÉGRÉE DANS L'APP POUR LE PAIEMENT */}
      <Modal
        visible={showWebview}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseWebview}
      >
        <SafeAreaView style={styles.webviewSafeArea}>
          {/* Header du Guichet */}
          <View style={styles.webviewHeader}>
            <View style={styles.webviewHeaderLeft}>
              <Lock size={16} color={THEME.colors.gold} />
              <Text style={styles.webviewHeaderTitle}>Guichet GeniusPay Sécurisé</Text>
            </View>
            <TouchableOpacity onPress={handleCloseWebview} style={styles.webviewCloseBtn}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Indicateur de chargement */}
          {webviewLoading && (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color={THEME.colors.gold} />
              <Text style={styles.webviewLoaderText}>Chargement du guichet de paiement...</Text>
            </View>
          )}

          {/* Navigateur Web Intégré */}
          {paymentUrl && (
            <WebView
              source={{ uri: paymentUrl }}
              style={styles.webview}
              onLoadEnd={() => setWebviewLoading(false)}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
            />
          )}

          {/* Barre d'Action Sécurisée avec Vérification d'API */}
          <View style={styles.webviewBottomBar}>
            <TouchableOpacity
              style={styles.confirmPaidBtn}
              onPress={verifyAndComplete}
              disabled={verifying}
              activeOpacity={0.85}
            >
              {verifying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmPaidBtnText}>Vérifier & Valider mon abonnement ✓</Text>
              )}
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 16,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: THEME.colors.gold,
    backgroundColor: '#FFFDF5',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: THEME.colors.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.gold,
  },
  planTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  planTitleActive: {
    color: THEME.colors.textPrimary,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 30,
  },
  planPriceFcfa: {
    color: THEME.colors.gold,
    fontSize: 20,
    fontWeight: '900',
  },
  planPriceEuro: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  planPeriod: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  planSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginLeft: 30,
    marginTop: 2,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  cardGradient: {
    padding: 16,
  },
  benefitsList: {
    gap: 10,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
    fontWeight: '600',
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
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
    marginBottom: 12,
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
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  reassuranceText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  webviewSafeArea: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161616',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  webviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webviewHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  webviewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0D0D0D',
  },
  webviewLoaderText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webviewBottomBar: {
    backgroundColor: '#161616',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  confirmPaidBtn: {
    backgroundColor: THEME.colors.gold,
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPaidBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
