import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';

export const MusicScreen = ({ onSelectAlbum }) => {
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const filters = ['Tous', 'Albums', 'Singles'];

  const filteredReleases = SAMPLE_DATA.audioReleases.filter((item) => {
    if (selectedFilter === 'Tous') return true;
    if (selectedFilter === 'Albums') return item.type === 'album';
    if (selectedFilter === 'Singles') return item.type === 'single';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Albums</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filtres Tous / Albums / Singles */}
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

      {/* Grille des Albums */}
      <FlatList
        data={filteredReleases}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => onSelectAlbum(item)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.cover }} style={styles.coverImage} />
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.year}>{item.year}</Text>
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
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '47%',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  year: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
