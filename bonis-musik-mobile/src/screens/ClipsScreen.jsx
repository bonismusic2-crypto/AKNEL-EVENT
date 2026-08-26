import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, MoreVertical } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { SAMPLE_DATA } from '../data/sampleData';
import { DownloadService } from '../services/downloadService';
import { MediaOptionsMenu } from '../components/MediaOptionsMenu';

export const ClipsScreen = ({ onSelectClip }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clips officiels</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={SAMPLE_DATA.videoClips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clipCard}
            onPress={() => onSelectClip(item)}
            activeOpacity={0.85}
          >
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>
              <View style={styles.durationTag}>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.date} • {item.views}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMenuItem({ ...item, type: 'video' });
                  setIsMenuVisible(true);
                }}
                style={{ padding: 6 }}
                activeOpacity={0.7}
              >
                <MoreVertical size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal Options 3 points */}
      <MediaOptionsMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        item={selectedMenuItem}
        onPlayDirect={(clip) => onSelectClip(clip)}
        onToggleDownload={async (clip) => {
          await DownloadService.toggleDownload(clip);
        }}
        onToggleFavorite={(clip) => {
          Alert.alert('Favoris', `"${clip.title}" a été ajouté à vos favoris.`);
        }}
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
  listContainer: {
    paddingBottom: 24,
    gap: 20,
  },
  clipCard: {
    backgroundColor: '#141414',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#1A1A1A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  durationTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    padding: 14,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
});
