import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export const PaymentCancelScreen = ({ onRetry, onBack, onHome }) => {
  const handleOpenWhatsApp = () => {
    Linking.openURL('https://wa.me/2250556018787?text=Bonjour%20Bonis%20Musik,%20j%27ai%20besoin%20d%27aide%20pour%20finaliser%20mon%20abonnement%20VIP');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Icône d'annulation */}
        <View style={styles.iconCircle}>
          <XCircle size={44} color="#D97706" strokeWidth={2.2} />
        </View>

        <View style={styles.badgeWarn}>
          <ShieldAlert size={14} color="#D97706" />
          <Text style={styles.badgeWarnText}>PAIEMENT NON FINALISÉ</Text>
        </View>

        <Text style={styles.title}>Abonnement Interrompu</Text>
        <Text style={styles.subtitle}>
          Vous avez annulé ou interrompu la transaction sur GeniusPay. Aucun montant n'a été prélevé sur votre compte Mobile Money ou carte bancaire.
        </Text>

        {/* Encadré d'Aide */}
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Besoin d'un coup de main ?</Text>
          <Text style={styles.helpText}>
            Si vous rencontrez une difficulté avec le paiement par Wave, Orange Money, MTN ou Carte, notre équipe est disponible pour vous assister immédiatement.
          </Text>
        </View>

        {/* Boutons d'Action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            activeOpacity={0.85}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Réessayer le Paiement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleOpenWhatsApp}
            activeOpacity={0.8}
          >
            <MessageCircle size={16} color={THEME.colors.textPrimary} />
            <Text style={styles.whatsappBtnText}>Assistance WhatsApp Directe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack || onHome}
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.backBtnText}>Retourner à l'Accueil Découverte</Text>
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  badgeWarnText: {
    color: '#D97706',
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
    marginBottom: 24,
  },
  helpBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 28,
    width: '100%',
  },
  helpTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  helpText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  retryBtn: {
    backgroundColor: THEME.colors.gold,
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  whatsappBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  whatsappBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
