import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Play, Sparkles, BookOpen, Heart, Share2, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, useAppTheme } from '../constants/theme';

export const DailyMeditationModal = ({
  visible,
  onClose,
  meditation,
  onPlaySong,
}) => {
  const { theme, isDarkMode } = useAppTheme();

  if (!meditation) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🕊️ Méditation du Jour - Bonis Musik\n\n📖 ${meditation.ref} : ${meditation.verse}\n\n💡 Enseignement : ${meditation.explanation}\n\n🙏 Prière : ${meditation.prayer}\n\n🎵 Écouté sur l'application Bonis Musik du Chantre Boniface.`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const formattedDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        {/* Header Modal */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(197, 155, 39, 0.15)' }]}>
              <BookOpen size={18} color={theme.colors.gold} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Méditation Quotidienne</Text>
              <Text style={[styles.headerDate, { color: theme.colors.gold }]}>{formattedDate}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={handleShare} style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Share2 size={17} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <X size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          {/* Badge Thématique */}
          <View style={styles.badgeRow}>
            <View style={[styles.themePill, { backgroundColor: isDarkMode ? 'rgba(197, 155, 39, 0.18)' : '#FEF3C7', borderColor: theme.colors.gold }]}>
              <Sparkles size={12} color={theme.colors.gold} />
              <Text style={[styles.themePillText, { color: theme.colors.gold }]}>{meditation.theme}</Text>
            </View>
          </View>

          {/* Titre de la Méditation */}
          <Text style={[styles.meditationTitle, { color: theme.colors.textPrimary }]}>
            {meditation.title}
          </Text>

          {/* Encadré Lumineux du Verset Biblique */}
          <View style={[styles.verseCard, { borderColor: theme.colors.cardBorder }]}>
            <LinearGradient
              colors={isDarkMode ? ['#1E1B18', '#141312', '#0D0D0D'] : ['#FFFBEB', '#FEF3C7', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.verseCardGradient}
            >
              <View style={styles.quoteIconRow}>
                <Text style={[styles.quoteSymbol, { color: theme.colors.gold }]}>“</Text>
              </View>
              <Text style={[styles.verseText, { color: theme.colors.textPrimary }]}>
                {meditation.verse}
              </Text>
              <Text style={[styles.verseRef, { color: theme.colors.gold }]}>
                — {meditation.ref}
              </Text>
            </LinearGradient>
          </View>

          {/* Section 1 : Explication & Enseignement Prophétique */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionBullet, { backgroundColor: theme.colors.gold }]} />
              <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
                La Pensée & l'Explication du Chantre
              </Text>
            </View>
            <View style={[styles.textCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
                {meditation.explanation}
              </Text>
            </View>
          </View>

          {/* Section 2 : Prière Guidée du Jour */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionBullet, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
                Prière d'Élévation & de Déclaration
              </Text>
            </View>
            <View style={[styles.prayerCard, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' }]}>
              <Heart size={16} color="#10B981" style={{ marginBottom: 6 }} />
              <Text style={[styles.prayerText, { color: isDarkMode ? '#E5E7EB' : '#065F46' }]}>
                {meditation.prayer}
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerDate: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  badgeRow: {
    marginBottom: 10,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  meditationTitle: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 28,
  },
  verseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  verseCardGradient: {
    padding: 20,
  },
  quoteIconRow: {
    marginBottom: -10,
  },
  quoteSymbol: {
    fontSize: 38,
    fontFamily: 'serif',
    fontWeight: '900',
    lineHeight: 40,
  },
  verseText: {
    fontSize: 15,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 23,
    fontWeight: '600',
  },
  verseRef: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 10,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionBullet: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  textCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: '400',
  },
  prayerCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  prayerText: {
    fontSize: 13.5,
    lineHeight: 21,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  songIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  songAlbum: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  playBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
