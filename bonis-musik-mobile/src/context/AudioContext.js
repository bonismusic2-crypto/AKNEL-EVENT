import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext(null);

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

      const trackUrl = track.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
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
