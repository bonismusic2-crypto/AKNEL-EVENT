import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Layers, User } from 'lucide-react-native';
import { useAppTheme } from '../constants/theme';

export const BottomNavigation = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  
  // Rehaussement généreux au-dessus des touches Android
  const bottomPadding = Math.max(insets.bottom + 14, Platform.OS === 'android' ? 28 : 34);

  const tabs = [
    { key: 'home', label: 'Accueil', Icon: Home },
    { key: 'library', label: 'Médiathèque', Icon: Layers },
    { key: 'profile', label: 'Profil', Icon: User },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.navBg || (theme.isDark ? '#141414' : '#FFFFFF'),
          borderColor: theme.colors.navBorder || (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.Icon;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <IconComponent
              size={20}
              color={isActive ? theme.colors.gold : theme.colors.inactiveTab}
              strokeWidth={isActive ? 2.3 : 1.6}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.colors.gold : theme.colors.inactiveTab },
                isActive && styles.activeLabel,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 10,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeLabel: {
    fontWeight: '800',
  },
});
