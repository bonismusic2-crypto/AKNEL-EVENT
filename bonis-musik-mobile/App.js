import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import { BottomNavigation } from './src/components/BottomNavigation';
import { MiniPlayer } from './src/components/MiniPlayer';
import { FullAudioPlayerModal } from './src/components/FullAudioPlayerModal';
import { supabase } from './src/lib/supabase';
import { SubscriptionService } from './src/services/subscriptionService';

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Traitement du flux post-authentification : vérification de l'abonnement
  const processUserAuth = async (user) => {
    setCurrentUser(user);
    if (!user) {
      setAppState('welcome');
      return;
    }

    try {
      const { isSubscribed } = await SubscriptionService.checkSubscription(user);
      if (isSubscribed) {
        setAppState('main');
      } else {
        // Redirection systématique vers le Paywall pour les non-abonnés
        setAppState('paywall');
      }
    } catch (e) {
      console.warn('Erreur vérification post-auth:', e);
      setAppState('paywall');
    }
  };

  // Vérifier la session active au lancement de l'application
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await processUserAuth(session.user);
        } else {
          setAppState('welcome');
        }
      } catch (err) {
        console.warn('Session init error:', err);
        setAppState('welcome');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        setAppState('welcome');
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
                processUserAuth(user);
              }}
              onBack={() => setAppState('welcome')}
            />
          )}

          {/* 3. Écran Paywall (Abonnement 2 € / mois) */}
          {appState === 'paywall' && (
            <PaywallScreen
              currentUser={currentUser}
              onBack={() => setAppState('main')}
              onSuccess={() => {
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
                        currentUser={currentUser}
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

                    {/* Onglet 3 : PROFIL UTILISATEUR & GESTION */}
                    {activeTab === 'profile' && (
                      <ProfileScreen
                        currentUser={currentUser}
                        onOpenPaywall={() => setAppState('paywall')}
                        onLogout={() => {
                          setCurrentUser(null);
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
