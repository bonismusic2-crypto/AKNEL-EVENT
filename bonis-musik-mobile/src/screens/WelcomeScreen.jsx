import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const WelcomeScreen = ({ onStart, onLogin }) => {
  return (
    <View style={styles.container}>
      {/* Visuel immersif plein écran officiel (screen 1.png) */}
      <ImageBackground
        source={require('../../assets/chantre-boniface.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
          style={styles.gradientOverlay}
        >
          <SafeAreaView style={styles.safeContent}>
            
            {/* Header avec Logo Officiel Icon */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon boni musik.png')}
                style={styles.officialLogo}
                resizeMode="contain"
              />
            </View>

            {/* Texte d'Accroche & Boutons d'Action */}
            <View style={styles.bottomSection}>
              <Text style={styles.tagline}>
                Entrez dans la dimension de l'adoration et de la parole avec le Chantre Boniface.
              </Text>

              {/* Bouton Commencer */}
              <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
                <LinearGradient
                  colors={THEME.colors.goldGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Text style={styles.startBtnText}>Commencer</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Lien Se Connecter */}
              <TouchableOpacity style={styles.loginRow} onPress={onLogin} activeOpacity={0.7}>
                <Text style={styles.loginText}>
                  Déjà un compte ? <Text style={styles.loginHighlight}>Se connecter</Text>
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
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  officialLogo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: THEME.colors.gold,
  },
  bottomSection: {
    marginBottom: 20,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  startBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  startGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loginRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
  },
  loginHighlight: {
    color: THEME.colors.gold,
    fontWeight: '800',
  },
});
