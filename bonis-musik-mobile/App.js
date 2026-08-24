import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import { BottomNavigation } from './src/components/BottomNavigation';
import { MiniPlayer } from './src/components/MiniPlayer';
import { FullAudioPlayerModal } from './src/components/FullAudioPlayerModal';
import { supabase } from './src/lib/supabase';

// Écrans
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MediaLibraryScreen } from './src/screens/MediaLibraryScreen';
import { AlbumDetailScreen } from './src/screens/AlbumDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';

export default function App() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'auth', 'main', 'paywall'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'library', 'profile'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Vérifier la session active au lancement de l'application
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setAppState('main');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const handleBackFromAlbum = () => {
    setSelectedAlbum(null);
  };

  return (
    <SafeAreaProvider>
      <AudioProvider>
        <View style={styles.container}>
          {/* StatusBar sombre sur fond clair */}
          <StatusBar style="dark" />

          {/* 1. Écran de Bienvenue Onboarding */}
          {appState === 'welcome' && (
            <WelcomeScreen
              onStart={() => setAppState('auth')}
              onLogin={() => setAppState('auth')}
            />
          )}

          {/* 2. Écran d'Authentification Supabase */}
          {appState === 'auth' && (
            <AuthScreen
              onSuccess={(user) => {
                setCurrentUser(user);
                setAppState('main');
              }}
              onBack={() => setAppState('welcome')}
            />
          )}

          {/* 3. Écran Paywall (Abonnement 2 € / mois) */}
          {appState === 'paywall' && (
            <PaywallScreen
              onBack={() => setAppState('main')}
              onSuccess={() => {
                Alert.alert('Félicitations !', 'Votre abonnement Premium VIP est actif.');
                setAppState('main');
              }}
            />
          )}

          {/* 4. Application Principale avec 3 Onglets Épurés */}
          {appState === 'main' && (
            <View style={styles.mainContainer}>
              <View style={styles.contentArea}>
                {selectedAlbum ? (
                  <AlbumDetailScreen
                    album={selectedAlbum}
                    onBack={handleBackFromAlbum}
                  />
                ) : (
                  <>
                    {/* Onglet 1 : ACCUEIL */}
                    {activeTab === 'home' && (
                      <HomeScreen
                        onSelectAlbum={handleSelectAlbum}
                        onSelectClip={() => setActiveTab('library')}
                        onSelectTeaching={() => setActiveTab('library')}
                        onOpenProfile={() => setActiveTab('profile')}
                        onOpenPaywall={() => setAppState('paywall')}
                      />
                    )}

                    {/* Onglet 2 : MÉDIATHÈQUE UNIFIÉE (Musique, Clips & Enseignements) */}
                    {activeTab === 'library' && (
                      <MediaLibraryScreen
                        onSelectAlbum={handleSelectAlbum}
                        onSelectClip={() => {}}
                        onSelectTeaching={() => {}}
                      />
                    )}

                    {/* Onglet 3 : PROFIL UTILISATEUR & ABONNEMENT */}
                    {activeTab === 'profile' && (
                      <ProfileScreen
                        currentUser={currentUser}
                        onOpenPaywall={() => setAppState('paywall')}
                        onLogout={() => {
                          setAppState('welcome');
                          setActiveTab('home');
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Lecteur Audio Mini Persistant */}
              <MiniPlayer />

              {/* Barre de Navigation Épurée (3 Boutons) */}
              <BottomNavigation
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setSelectedAlbum(null);
                  setActiveTab(tab);
                }}
              />

              {/* Lecteur Audio Plein Écran Modal */}
              <FullAudioPlayerModal />
            </View>
          )}
        </View>
      </AudioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentArea: {
    flex: 1,
  },
});
