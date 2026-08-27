import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]); // File d'attente / Album en cours d'écoute
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [history, setHistory] = useState([]);

  // Références mutables pour accès immédiat dans onPlaybackStatusUpdate
  const playlistRef = useRef(playlist);
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  playlistRef.current = playlist;
  currentTrackRef.current = currentTrack;
  isPlayingRef.current = isPlaying;

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

      // ✅ ENCHAÎNEMENT AUTOMATIQUE : Si le morceau se termine, passer au suivant
      if (status.didJustFinish) {
        handlePlayNext();
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
   * ⏭️ Passer au morceau SUIVANT
   */
  const handlePlayNext = async () => {
    const list = playlistRef.current;
    const current = currentTrackRef.current;

    if (!list || list.length === 0 || !current) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = list.findIndex((t) => String(t.id) === String(current.id));
    if (currentIndex !== -1 && currentIndex + 1 < list.length) {
      const nextTrack = list[currentIndex + 1];
      await playTrack(nextTrack, list);
    } else if (list.length > 0) {
      // Reboucler au premier morceau si fin d'album
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
