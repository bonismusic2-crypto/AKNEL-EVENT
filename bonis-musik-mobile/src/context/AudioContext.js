import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext(null);

const INITIAL_HISTORY = [
  {
    id: 101,
    title: 'Tu es fidèle',
    artist: 'Chantre Boniface',
    album: 'ÉLÉVATION',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    duration: '04:25',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'song',
    playedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 't-1',
    title: 'La puissance de la louange prophétique',
    artist: 'Chantre Boniface',
    album: 'Enseignement',
    cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300',
    duration: '45 min',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    type: 'teaching',
    playedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 102,
    title: 'Ton amour est fidèle',
    artist: 'Chantre Boniface',
    album: 'ÉLÉVATION',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
    duration: '05:12',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    type: 'song',
    playedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState({
    id: 101,
    title: 'Tu es fidèle',
    artist: 'Chantre Boniface',
    album: 'ÉLÉVATION',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    duration: '04:25',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [history, setHistory] = useState(INITIAL_HISTORY);

  useEffect(() => {
    // Configurer le mode audio pour autoriser la lecture en tâche de fond
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(console.error);

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis || 0);
      setDurationMillis(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMillis(0);
      }
    }
  };

  const playTrack = async (track) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setCurrentTrack(track);
      setIsPlaying(true);

      // Ajouter à l'historique d'écoute
      const historyItem = {
        id: track.id || Date.now(),
        title: track.title || 'Titre inconnu',
        artist: track.artist || 'Chantre Boniface',
        album: track.album || (track.type === 'teaching' ? 'Enseignement' : 'Single / Album'),
        cover: track.cover || track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        duration: track.duration || '04:00',
        url: track.url || track.videoUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        type: track.type || (track.duration?.includes('min') || track.duration?.includes('h') ? 'teaching' : 'song'),
        playedAt: new Date().toISOString(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => String(item.id) !== String(track.id));
        return [historyItem, ...filtered].slice(0, 50);
      });

      const trackUrl = track.url || track.videoUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.warn('Erreur lecture audio expo-av:', error);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      } else if (currentTrack) {
        await playTrack(currentTrack);
      }
    } catch (error) {
      console.warn('Erreur togglePlayPause:', error);
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = async (millis) => {
    try {
      if (sound) {
        await sound.setPositionAsync(millis);
      }
    } catch (err) {
      console.warn('Erreur seekTo:', err);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id) => {
    setHistory((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        positionMillis,
        durationMillis,
        isFullPlayerVisible,
        setIsFullPlayerVisible,
        playTrack,
        togglePlayPause,
        seekTo,
        history,
        clearHistory,
        removeFromHistory,
        closeCurrentTrack: () => {
          if (sound) sound.stopAsync().catch(() => {});
          setCurrentTrack(null);
        }
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
