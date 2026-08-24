import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';

export const TeachingsScreen = ({ onSelectTeaching }) => {
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const filters = ['Tous', 'Audio', 'Vidéo', 'Séries'];

  const filteredTeachings = SAMPLE_DATA.teachings.filter((item) => {
    if (selectedFilter === 'Tous') return true;
    if (selectedFilter === 'Audio') return item.type === 'audio';
    if (selectedFilter === 'Vidéo') return item.type === 'video';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enseignements</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filtres d'onglets */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste des enseignements */}
      <FlatList
        data={filteredTeachings}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => onSelectTeaching(item)}
            activeOpacity={0.75}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.type === 'audio' ? '🎙️ Audio' : '🎥 Vidéo'} • {item.duration}
              </Text>
            </View>
            <View style={styles.playBtn}>
              <Play size={16} color={THEME.colors.gold} fill={THEME.colors.gold} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.gold,
  },
  filterText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0D0D0D',
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 14,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
