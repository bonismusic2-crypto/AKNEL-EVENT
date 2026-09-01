import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Music } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export const WelcomeScreen = ({ onStart, onLogin }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Visuel immersif plein écran du Chantre Boniface */}
      <ImageBackground
        source={require('../../assets/chantre-boniface.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dégradé doux : clair en haut pour laisser le visage visible, sombre en bas pour les textes */}
        <LinearGradient
          colors={[
            'rgba(13, 13, 13, 0.4)',
            'rgba(13, 13, 13, 0.1)',
            'rgba(13, 13, 13, 0.75)',
            'rgba(13, 13, 13, 0.98)',
          ]}
          locations={[0, 0.35, 0.68, 1]}
          style={styles.gradientOverlay}
        >
          <SafeAreaView style={styles.safeContent}>
            
            {/* Header épuré : Badge doré discret en haut sans masquer le visage */}
            <View style={styles.topHeader}>
              <View style={styles.brandBadge}>
                <Sparkles size={13} color={THEME.colors.gold} />
                <Text style={styles.brandBadgeText}>BONIS MUSIK • OFFICIEL</Text>
              </View>
            </View>

            {/* Section Inférieure : Titre & Carte Glassmorphism */}
            <View style={styles.bottomSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.artistName}>Chantre Boniface</Text>
                <Text style={styles.mainTitle}>
                  Entrez dans la Présence & l'Adoration
                </Text>
                <Text style={styles.tagline}>
                  Albums, clips vidéo HD, enseignements et prières prophétiques en streaming illimité.
                </Text>
              </View>

              {/* Bouton Commencer Doré Premium */}
              <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
                <LinearGradient
                  colors={THEME.colors.goldGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Text style={styles.startBtnText}>Commencer l'expérience</Text>
                  <ArrowRight size={18} color="#0D0D0D" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Lien Se Connecter */}
              <TouchableOpacity style={styles.loginRow} onPress={onLogin} activeOpacity={0.7}>
                <Text style={styles.loginText}>
                  Déjà membre VIP ? <Text style={styles.loginHighlight}>Se connecter</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  safeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 39, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  brandBadgeText: {
    color: '#F3D068',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bottomSection: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 24,
  },
  artistName: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  startBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  startGradient: {
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loginRow: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  loginHighlight: {
    color: THEME.colors.gold,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
