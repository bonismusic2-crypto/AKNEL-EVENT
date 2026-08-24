import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { supabase } from '../lib/supabase';

export const AuthScreen = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async () => {
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 1. CONNEXION SUPABASE
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          // Si compte inexistant ou mot de passe faux
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect.');
          }
          throw error;
        }

        onSuccess(data.user);
      } else {
        // 2. INSCRIPTION SUPABASE
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName.trim() || 'Abonné Bonis',
              phone: phone.trim() || '',
            },
          },
        });

        if (error) throw error;

        // Auto-connexion ou message de succès
        Alert.alert(
          'Compte créé avec succès !',
          'Bienvenue dans l\'univers Bonis Musik.',
          [{ text: 'Continuer', onPress: () => onSuccess(data.user) }]
        );
      }
    } catch (err) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Titre & Sous-titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Bonis Musik</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte en quelques secondes'}
          </Text>
        </View>

        {/* Toggle Connexion / Inscription */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => { setIsLogin(true); setErrorMessage(''); }}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Connexion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => { setIsLogin(false); setErrorMessage(''); }}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Inscription</Text>
          </TouchableOpacity>
        </View>

        {/* Message d'erreur s'il y a lieu */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <View style={styles.inputWrapper}>
                <User size={18} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom & Prénoms"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Phone size={18} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro WhatsApp / Mobile Money"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Mail size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Adresse email"
              placeholderTextColor={THEME.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe (min 6 car.)"
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

          {/* Bouton Principal Authentification */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>{isLogin ? 'Se connecter' : "Créer mon compte"}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Séparateur */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Accès Démo Rapide / Visiteur */}
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => onSuccess({ email: 'visiteur@bonismusik.com', user_metadata: { full_name: 'Visiteur' } })}
        >
          <Text style={styles.guestBtnText}>⚡ Continuer en mode Découverte</Text>
        </TouchableOpacity>

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
    marginBottom: 24,
  },
  title: {
    color: THEME.colors.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
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
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    gap: 12,
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
  submitBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
  guestBtn: {
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
  guestBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  termsHighlight: {
    color: THEME.colors.textSecondary,
  },
});
