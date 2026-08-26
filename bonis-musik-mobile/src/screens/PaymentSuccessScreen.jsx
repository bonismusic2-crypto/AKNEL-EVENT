import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Calendar,
  Clock,
  CreditCard,
  ArrowRight,
  Share2,
  Receipt,
  Sparkles,
  Lock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const PaymentSuccessScreen = ({ txId, planType = 'monthly', onContinue, currentUser }) => {
  const buyerName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Abonné Bonis';
  const buyerEmail = currentUser?.email || 'abonne@bonismusik.com';
  
  const isAnnual = planType === 'annual';
  const planLabel = isAnnual ? 'Abonnement Annuel (1 An)' : 'Abonnement Mensuel (1 Mois)';
  const amountFcfa = isAnnual ? '10 000 FCFA' : '1 000 FCFA';
  const amountEuro = isAnnual ? '~15,00 EUR' : '~1,50 EUR';

  // Date de transaction actuelle et date d'échéance (+1 mois ou +1 an)
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const paymentDate = now.toLocaleDateString('fr-FR', options);
  
  const dueDateTime = isAnnual
    ? new Date(now.setFullYear(now.getFullYear() + 1))
    : new Date(now.setMonth(now.getMonth() + 1));
  const dueDate = dueDateTime.toLocaleDateString('fr-FR', options);

  const referenceCode = txId || 'GP_SANDBOX_' + Date.now().toString().slice(-8);

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Reçu d'abonnement Bonis Musik\nFormule: ${planLabel}\nRéférence: ${referenceCode}\nMontant: ${amountFcfa} (${amountEuro})\nTitulaire: ${buyerName}\nProchaine échéance: ${dueDate}`,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header avec Icône Succès */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={40} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.badgeSuccess}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.badgeSuccessText}>TRANSACTION VALIDÉE VIA GENIUSPAY</Text>
          </View>
          <Text style={styles.title}>Abonnement Confirmé !</Text>
          <Text style={styles.subtitle}>
            Votre souscription a été enregistrée avec succès. Vous avez accès à tous les contenus du Chantre Boniface.
          </Text>
        </View>

        {/* CARTE REÇU OFFICIEL DE TRANSACTION MOBILE */}
        <View style={styles.receiptCard}>
          {/* Header du Reçu */}
          <View style={styles.receiptHeader}>
            <View style={styles.receiptBrandRow}>
              <View style={styles.receiptLogoCircle}>
                <Receipt size={18} color={THEME.colors.gold} />
              </View>
              <View>
                <Text style={styles.receiptBrand}>BONIS <Text style={{ color: THEME.colors.gold }}>MUSIK</Text></Text>
                <Text style={styles.receiptType}>REÇU D'ABONNEMENT OFFICIEL</Text>
              </View>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>{amountFcfa}</Text>
              <Text style={styles.amountSubText}>{amountEuro}</Text>
            </View>
          </View>

          {/* Ligne pointillée décorative */}
          <View style={styles.dashedDivider} />

          {/* Corps des détails de la transaction */}
          <View style={styles.receiptBody}>
            {/* Ligne 1 : Formule choisie */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Formule d'Accès</Text>
              <Text style={[styles.detailValue, { color: THEME.colors.gold, fontWeight: '800' }]}>{planLabel}</Text>
            </View>

            {/* Ligne 2 : Titulaire & Email */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Titulaire du Compte</Text>
              <Text style={styles.detailValue}>{buyerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse Email</Text>
              <Text style={styles.detailValue}>{buyerEmail}</Text>
            </View>

            {/* Ligne 3 : Mode de prélèvement */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Moyen de Règlement</Text>
              <View style={styles.paymentMethodTag}>
                <Smartphone size={12} color="#059669" />
                <Text style={styles.paymentMethodText}>Mobile Money / GeniusPay</Text>
              </View>
            </View>

            {/* Ligne 4 : Référence GeniusPay */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Réf. Transaction</Text>
              <Text style={styles.monoValue}>{referenceCode}</Text>
            </View>

            {/* Ligne 5 : Date de prélèvement */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date du Règlement</Text>
              <Text style={styles.detailValue}>{paymentDate}</Text>
            </View>

            {/* Ligne 6 : Prochaine date d'échéance */}
            <View style={[styles.detailRow, styles.dueDateRow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color={THEME.colors.gold} />
                <Text style={[styles.detailLabel, { color: THEME.colors.gold, fontWeight: '800' }]}>
                  Prochaine Échéance
                </Text>
              </View>
              <Text style={styles.dueDateValue}>{dueDate}</Text>
            </View>
          </View>

          {/* Footer du Reçu : Avantages Débloqués */}
          <View style={styles.receiptFooter}>
            <View style={styles.perksContainer}>
              <View style={styles.perkItem}>
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.perkItemText}>Audio HD Illimité (Tous les albums)</Text>
              </View>
              <View style={styles.perkItem}>
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.perkItemText}>Téléchargements Hors-Ligne In-App</Text>
              </View>
              <View style={styles.perkItem}>
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.perkItemText}>Clips Vidéo & Enseignements exclusifs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Boutons d'Action */}
        <View style={styles.actionsContainer}>
          {/* Bouton Partager le reçu */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareReceipt}
            activeOpacity={0.8}
          >
            <Share2 size={16} color={THEME.colors.textPrimary} />
            <Text style={styles.shareBtnText}>Partager mon reçu</Text>
          </TouchableOpacity>

          {/* Bouton Principal : Commencer l'écoute */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Accéder aux musiques</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    marginBottom: 10,
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
    marginBottom: 6,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  receiptBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  receiptLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBrand: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  receiptType: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: THEME.colors.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  amountSubText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  dashedDivider: {
    borderBottomWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
  receiptBody: {
    padding: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    color: THEME.colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  paymentMethodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentMethodText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  monoValue: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueDateRow: {
    backgroundColor: '#FFFDF5',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.25)',
    marginTop: 4,
  },
  dueDateValue: {
    color: THEME.colors.gold,
    fontSize: 12.5,
    fontWeight: '900',
  },
  receiptFooter: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  perksContainer: {
    gap: 8,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkItemText: {
    color: THEME.colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    borderRadius: 25,
  },
  shareBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  continueBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
