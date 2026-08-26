import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
  Lock,
  Download,
  FileText,
  Image as ImageIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const PaymentSuccessScreen = ({ txId, planType = 'monthly', onContinue, currentUser }) => {
  const [downloading, setDownloading] = useState(false);
  const viewShotRef = useRef();

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

  // 1. Partager le texte du reçu
  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Reçu d'abonnement Bonis Musik\nFormule: ${planLabel}\nRéférence: ${referenceCode}\nMontant: ${amountFcfa} (${amountEuro})\nTitulaire: ${buyerName}\nProchaine échéance: ${dueDate}`,
      });
    } catch (e) {}
  };

  // 2. Télécharger / Partager en IMAGE (PNG HD)
  const handleDownloadImage = async () => {
    if (viewShotRef.current) {
      setDownloading(true);
      try {
        const uri = await viewShotRef.current.capture();
        setDownloading(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Enregistrer le Reçu Bonis Musik (Image)',
          });
        } else {
          Alert.alert('Reçu capturé', 'Votre reçu a été généré avec succès.');
        }
      } catch (err) {
        setDownloading(false);
        console.warn('Erreur capture image reçu:', err);
        Alert.alert('Erreur', 'Impossible de capturer l\'image du reçu.');
      }
    }
  };

  // 3. Télécharger / Partager en PDF Haute Définition
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 40px;
                background-color: #f9fafb;
                color: #111827;
              }
              .card {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                border: 2px solid #e5e7eb;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background: #111827;
                color: #ffffff;
                padding: 30px;
                text-align: center;
              }
              .brand {
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 2px;
                color: #ffffff;
              }
              .brand span {
                color: #C59B27;
              }
              .type {
                font-size: 11px;
                letter-spacing: 1.5px;
                color: #9ca3af;
                margin-top: 5px;
                font-weight: 700;
              }
              .badge {
                display: inline-block;
                margin-top: 15px;
                background: rgba(16, 185, 129, 0.2);
                color: #10B981;
                border: 1px solid #10B981;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 1px;
              }
              .body {
                padding: 30px;
              }
              .amount-row {
                text-align: center;
                padding-bottom: 25px;
                border-bottom: 2px dashed #e5e7eb;
                margin-bottom: 25px;
              }
              .amount-val {
                font-size: 32px;
                font-weight: 900;
                color: #C59B27;
              }
              .amount-sub {
                font-size: 14px;
                color: #6b7280;
                font-weight: 600;
              }
              .row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #f3f4f6;
                font-size: 13px;
              }
              .label {
                color: #6b7280;
                font-weight: 600;
              }
              .val {
                color: #111827;
                font-weight: 700;
              }
              .highlight-row {
                background: #fffdf5;
                border: 1px solid #C59B27;
                border-radius: 8px;
                padding: 12px;
                margin-top: 15px;
              }
              .footer {
                background: #f9fafb;
                padding: 20px 30px;
                font-size: 11px;
                color: #6b7280;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="brand">BONIS <span>MUSIK</span></div>
                <div class="type">REÇU OFFICIEL D'ABONNEMENT</div>
                <div class="badge">TRANSACTION VALIDÉE VIA GENIUSPAY</div>
              </div>
              <div class="body">
                <div class="amount-row">
                  <div class="amount-val">${amountFcfa}</div>
                  <div class="amount-sub">${amountEuro}</div>
                </div>
                <div class="row">
                  <span class="label">Formule d'Accès :</span>
                  <span class="val" style="color: #C59B27;">${planLabel}</span>
                </div>
                <div class="row">
                  <span class="label">Titulaire du Compte :</span>
                  <span class="val">${buyerName}</span>
                </div>
                <div class="row">
                  <span class="label">Adresse Email :</span>
                  <span class="val">${buyerEmail}</span>
                </div>
                <div class="row">
                  <span class="label">Moyen de Règlement :</span>
                  <span class="val">Mobile Money / GeniusPay</span>
                </div>
                <div class="row">
                  <span class="label">Référence Transaction :</span>
                  <span class="val" style="font-family: monospace;">${referenceCode}</span>
                </div>
                <div class="row">
                  <span class="label">Date du Règlement :</span>
                  <span class="val">${paymentDate}</span>
                </div>
                <div class="row highlight-row">
                  <span class="label" style="color: #C59B27; font-weight: 800;">Prochaine Échéance :</span>
                  <span class="val" style="color: #C59B27; font-weight: 900;">${dueDate}</span>
                </div>
              </div>
              <div class="footer">
                Ce reçu certifie votre accès illimité à l'intégralité du catalogue musical, clips et enseignements du Chantre Boniface sur l'application Bonis Musik.
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      setDownloading(false);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger mon Reçu PDF Bonis Musik',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF généré', 'Votre fichier PDF a été préparé avec succès.');
      }
    } catch (err) {
      setDownloading(false);
      console.warn('Erreur génération PDF:', err);
      Alert.alert('Erreur', 'Impossible de générer le reçu PDF.');
    }
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

        {/* CARTE REÇU OFFICIEL DE TRANSACTION (CAPTURABLE EN IMAGE) */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
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
        </ViewShot>

        {/* SECTION DE TÉLÉCHARGEMENT & PARTAGE */}
        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>Télécharger ou partager votre reçu :</Text>
          <View style={styles.exportButtonsRow}>
            {/* Bouton Télécharger PDF */}
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={handleDownloadPDF}
              disabled={downloading}
              activeOpacity={0.8}
            >
              <FileText size={16} color="#DC2626" />
              <Text style={styles.exportBtnText}>Télécharger PDF</Text>
            </TouchableOpacity>

            {/* Bouton Télécharger Image PNG */}
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={handleDownloadImage}
              disabled={downloading}
              activeOpacity={0.8}
            >
              <ImageIcon size={16} color="#2563EB" />
              <Text style={styles.exportBtnText}>Enregistrer Image</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton Partager Texte */}
          <TouchableOpacity
            style={styles.shareTextBtn}
            onPress={handleShareReceipt}
            activeOpacity={0.8}
          >
            <Share2 size={15} color={THEME.colors.textSecondary} />
            <Text style={styles.shareTextBtnText}>Partager par WhatsApp / SMS</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton Principal : Accéder aux musiques */}
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
    marginBottom: 18,
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
  exportSection: {
    marginBottom: 20,
    gap: 10,
  },
  exportTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 16,
  },
  exportBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  shareTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  shareTextBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
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
