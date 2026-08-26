import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
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
import { PaymentSuccessScreen } from './src/screens/PaymentSuccessScreen';
import { PaymentCancelScreen } from './src/screens/PaymentCancelScreen';

export default function App() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'auth', 'paywall', 'payment_success', 'payment_cancel', 'main'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'library', 'profile'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastTxId, setLastTxId] = useState(null);

  // Fonction de routage intelligent selon le statut d'abonnement
  const routeUserAfterAuth = async (user) => {
    setCurrentUser(user);
    if (!user) {
      setAppState('welcome');
      return;
    }
    const isSubscribed = await SubscriptionService.isUserSubscribed(user);
    if (isSubscribed) {
      setAppState('main');
    } else {
      // Si nouvel inscrit ou non abonné -> direction Paywall obligatoire
      setAppState('paywall');
    }
  };

  // Vérifier la session active au lancement de l'application
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        routeUserAfterAuth(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
        setAppState('welcome');
      }
    });

    // Écoute des retours Deep Link (bonismusik://payment-success ou payment-cancel)
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url && url.includes('payment-success')) {
        if (currentUser) {
          SubscriptionService.activateVipSubscription(currentUser);
        }
        setAppState('payment_success');
      } else if (url && url.includes('payment-cancel')) {
        setAppState('payment_cancel');
      }
    };

    const linkingSub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.unsubscribe();
      linkingSub.remove();
    };
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
              onSuccess={async (user) => {
                await routeUserAfterAuth(user);
              }}
              onBack={() => setAppState('welcome')}
            />
          )}

          {/* 3. Écran Paywall GeniusPay (2 € / mois) */}
          {appState === 'paywall' && (
            <PaywallScreen
              currentUser={currentUser}
              onBack={() => setAppState('main')}
              onSuccess={(txId) => {
                setLastTxId(txId);
                setAppState('payment_success');
              }}
            />
          )}

          {/* 4. Écran de Succès du Paiement Mobile */}
          {appState === 'payment_success' && (
            <PaymentSuccessScreen
              txId={lastTxId}
              currentUser={currentUser}
              onContinue={() => setAppState('main')}
            />
          )}

          {/* 5. Écran d'Annulation du Paiement Mobile */}
          {appState === 'payment_cancel' && (
            <PaymentCancelScreen
              onRetry={() => setAppState('paywall')}
              onBack={() => setAppState('main')}
            />
          )}

          {/* 6. Application Principale avec 3 Onglets Épurés */}
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
