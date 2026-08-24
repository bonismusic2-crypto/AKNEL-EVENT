import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, History, Download, MessageCircle, Sliders, LogOut, ChevronRight, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { supabase } from '../lib/supabase';

export const ProfileScreen = ({ onOpenPaywall, onLogout, currentUser }) => {
  const [userProfile, setUserProfile] = useState({
    name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || SAMPLE_DATA.user.name,
    email: currentUser?.email || SAMPLE_DATA.user.email,
    phone: currentUser?.user_metadata?.phone || SAMPLE_DATA.user.phone,
    avatar: SAMPLE_DATA.user.avatar,
    plan: 'Abonnement VIP 2 € / mois',
    renewalDate: '24 Septembre 2026',
  });

  const menuItems = [
    { id: 1, title: "Historique d'écoute", Icon: History },
    { id: 2, title: 'Téléchargements hors-ligne', Icon: Download },
    { id: 3, title: 'Support / Contact WhatsApp', Icon: MessageCircle },
    { id: 4, title: 'Paramètres', Icon: Sliders },
  ];

  const handleLogoutPress = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header Profil */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Settings size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Info Utilisateur Connecté */}
        <View style={styles.userCard}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
            {userProfile.phone ? <Text style={styles.userPhone}>{userProfile.phone}</Text> : null}
          </View>
        </View>

        {/* Encadré Abonnement Actif - Premium VIP */}
        <View style={styles.subscriptionBox}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>👑 ABONNEMENT VIP ACTIF</Text>
          </View>
          <Text style={styles.planTitle}>{userProfile.plan}</Text>
          <Text style={styles.renewalText}>Prochain renouvellement : le {userProfile.renewalDate}</Text>

          <TouchableOpacity style={styles.manageBtn} onPress={onOpenPaywall} activeOpacity={0.85}>
            <LinearGradient
              colors={THEME.colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.manageBtnText}>Gérer mon abonnement</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu d'options */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const IconComponent = item.Icon;
            return (
              <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <IconComponent size={20} color={THEME.colors.textSecondary} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <ChevronRight size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color={THEME.colors.danger} />
              <Text style={[styles.menuItemText, { color: THEME.colors.danger }]}>Déconnexion</Text>
            </View>
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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 6,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: THEME.colors.gold,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  userPhone: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  subscriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: THEME.colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  renewalText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  manageBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
});
