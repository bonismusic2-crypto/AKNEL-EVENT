import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext(null);
const FAVORITES_STORAGE_KEY = '@bonis_favorite_tracks';

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]); // File d'attente / Album en cours d'écoute
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Nouveaux états multimédia professionnels
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [favorites, setFavorites] = useState([]); // Liste des IDs des titres favoris

  // Références mutables pour accès immédiat dans onPlaybackStatusUpdate
  const playlistRef = useRef(playlist);
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);

  playlistRef.current = playlist;
  currentTrackRef.current = currentTrack;
  isPlayingRef.current = isPlaying;
  isShuffleRef.current = isShuffle;
  repeatModeRef.current = repeatMode;

  useEffect(() => {
    // 1. Configurer le mode audio pour autoriser la lecture en tâche de fond
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(console.error);

    // 2. Charger les favoris sauvegardés localement
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Erreur chargement favoris:', e);
      }
    };
    loadFavorites();

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

      // ✅ ENCHAÎNEMENT AUTOMATIQUE À LA FIN D'UN MORCEAU
      if (status.didJustFinish) {
        if (repeatModeRef.current === 'one') {
          // Rejouer le même morceau
          if (sound) sound.replayAsync().catch(() => {});
        } else {
          handlePlayNext();
        }
      }
    }
  };

  /**
   * Joue une piste audio avec possibilité de passer la file d'attente (album ou playlist)
   */
  const playTrack = async (track, newPlaylist = null) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (newPlaylist && Array.isArray(newPlaylist)) {
        setPlaylist(newPlaylist);
        playlistRef.current = newPlaylist;
      }

      setCurrentTrack(track);
      currentTrackRef.current = track;
      setIsPlaying(true);
      setPositionMillis(0);

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

      const trackUrl = track.url || track.videoUrl;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.warn('Erreur lecture audio expo-av:', error);
      setIsPlaying(false);
    }
  };

  /**
   * 🔀 Toggle Mode Aléatoire (Shuffle)
   */
  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    isShuffleRef.current = nextShuffle;
  };

  /**
   * 🔁 Toggle Mode Répétition (Off -> All -> One -> Off)
   */
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    repeatModeRef.current = nextMode;
  };

  /**
   * ❤️ Toggle Favoris avec persistance locale
   */
  const toggleFavorite = async (track) => {
    if (!track) return false;
    const trackId = String(track.id);
    let nextFavorites = [];
    const isCurrentlyFav = favorites.some((f) => String(f.id || f) === trackId);

    if (isCurrentlyFav) {
      nextFavorites = favorites.filter((f) => String(f.id || f) !== trackId);
    } else {
      nextFavorites = [...favorites, track];
    }

    setFavorites(nextFavorites);
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    } catch (e) {
      console.warn('Erreur sauvegarde favoris:', e);
    }
    return !isCurrentlyFav;
  };

  const isTrackFavorite = (trackId) => {
    return favorites.some((f) => String(f.id || f) === String(trackId));
  };

  /**
   * ⏭️ Passer au morceau SUIVANT (avec support Shuffle et Repeat)
   */
  const handlePlayNext = async () => {
    const list = playlistRef.current;
    const current = currentTrackRef.current;

    if (!list || list.length === 0 || !current) {
      setIsPlaying(false);
      return;
    }

    // 1. Si mode aléatoire (Shuffle) activé
    if (isShuffleRef.current && list.length > 1) {
      const remaining = list.filter((t) => String(t.id) !== String(current.id));
      const randomIndex = Math.floor(Math.random() * remaining.length);
      const nextTrack = remaining[randomIndex] || list[0];
      await playTrack(nextTrack, list);
      return;
    }

    // 2. Mode Séquentiel
    const currentIndex = list.findIndex((t) => String(t.id) === String(current.id));
    if (currentIndex !== -1 && currentIndex + 1 < list.length) {
      const nextTrack = list[currentIndex + 1];
      await playTrack(nextTrack, list);
    } else if (list.length > 0 && repeatModeRef.current !== 'off') {
      // Reboucler au premier morceau si repeat activé
      const firstTrack = list[0];
      await playTrack(firstTrack, list);
    } else {
      setIsPlaying(false);
    }
  };

  /**
   * ⏮️ Revenir au morceau PRÉCÉDENT
   */
  const handlePlayPrevious = async () => {
    const list = playlistRef.current;
    const current = currentTrackRef.current;

    if (!list || list.length === 0 || !current) {
      if (sound) await sound.setPositionAsync(0);
      return;
    }

    const currentIndex = list.findIndex((t) => String(t.id) === String(current.id));
    if (currentIndex > 0) {
      const prevTrack = list[currentIndex - 1];
      await playTrack(prevTrack, list);
    } else {
      // Recommencer le morceau actuel depuis le début
      if (sound) await sound.setPositionAsync(0);
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
        playlist,
        setPlaylist,
        isPlaying,
        positionMillis,
        durationMillis,
        isFullPlayerVisible,
        setIsFullPlayerVisible,
        playTrack,
        handlePlayNext,
        handlePlayPrevious,
        togglePlayPause,
        seekTo,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        favorites,
        toggleFavorite,
        isTrackFavorite,
        history,
        clearHistory,
        removeFromHistory,
        closeCurrentTrack: () => {
          if (sound) sound.stopAsync().catch(() => {});
          setCurrentTrack(null);
        },
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
