import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const WelcomeScreen = ({ onStart, onLogin }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Logo & Titre Doré */}
        <View style={styles.logoSection}>
          <View style={styles.emblemContainer}>
            <Text style={styles.emblemCrown}>👑</Text>
            <Text style={styles.emblemLetter}>B</Text>
          </View>
          <Text style={styles.brandTitle}>BONIS</Text>
          <Text style={styles.brandSubtitle}>MUSIK</Text>
        </View>

        {/* Image du Chantre Boniface */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800' }}
            style={styles.artistImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(13, 13, 13, 0.95)', '#0D0D0D']}
            style={styles.gradientOverlay}
          />
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>
              Entrez dans la dimension de l'adoration et de la parole avec le Chantre Boniface.
            </Text>
          </View>
        </View>

        {/* Boutons d'Action */}
        <View style={styles.actionsContainer}>
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

          <TouchableOpacity style={styles.loginRow} onPress={onLogin}>
            <Text style={styles.loginText}>
              Déjà un compte ? <Text style={styles.loginHighlight}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  emblemContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  emblemCrown: {
    fontSize: 20,
    marginBottom: -6,
  },
  emblemLetter: {
    fontSize: 38,
    fontWeight: '900',
    color: THEME.colors.gold,
  },
  brandTitle: {
    color: THEME.colors.gold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
  },
  brandSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 2,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  captionText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 10,
  },
  startBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '800',
  },
  loginRow: {
    alignItems: 'center',
  },
  loginText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  loginHighlight: {
    color: THEME.colors.gold,
    fontWeight: '700',
  },
});
