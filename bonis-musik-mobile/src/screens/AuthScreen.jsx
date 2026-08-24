import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const AuthScreen = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Titre & Sous-titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue !</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        {/* Toggle Connexion / Inscription */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Connexion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Inscription</Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Email ou numéro de téléphone"
              placeholderTextColor={THEME.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={THEME.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={18} color={THEME.colors.textMuted} />
              ) : (
                <Eye size={18} color={THEME.colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          {/* Bouton Principal */}
          <TouchableOpacity style={styles.submitBtn} onPress={onSuccess} activeOpacity={0.85}>
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.submitText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Séparateur OU */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Boutons Sociaux */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialBtn} onPress={onSuccess}>
            <Text style={styles.socialText}>🌐  Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={onSuccess}>
            <Text style={styles.socialText}>🍎  Continuer avec Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Mentions Légales */}
        <Text style={styles.termsText}>
          En continuant, vous acceptez nos{'\n'}
          <Text style={styles.termsHighlight}>Conditions d'utilisation et Politique de confidentialité</Text>
        </Text>

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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: THEME.colors.gold,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: THEME.colors.gold,
    fontWeight: '800',
  },
  formContainer: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientBtn: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  socialContainer: {
    gap: 10,
  },
  socialBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  socialText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  termsText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
  termsHighlight: {
    color: THEME.colors.textSecondary,
  },
});
