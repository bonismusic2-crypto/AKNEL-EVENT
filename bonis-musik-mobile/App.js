import React, { useState, useEffect, useRef } from 'react';
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

  // Refs pour éviter les fermetures obsolètes (stale closures) et les re-renders intempestifs
  const appStateRef = useRef(appState);
  appStateRef.current = appState;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Fonction de routage intelligent selon le statut d'abonnement
  const routeUserAfterAuth = async (user) => {
    setCurrentUser(user);
    if (!user) {
      setAppState('welcome');
      return;
    }
    // Ne pas écraser les écrans de fin de paiement
    if (appStateRef.current === 'payment_success' || appStateRef.current === 'payment_cancel') {
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

  // Vérifier la session active et configurer les listeners globaux une seule fois au montage
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        routeUserAfterAuth(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        // Ne pas interrompre les écrans de résultat de paiement
        if (appStateRef.current !== 'payment_success' && appStateRef.current !== 'payment_cancel') {
          if (appStateRef.current === 'auth' || appStateRef.current === 'welcome') {
            await routeUserAfterAuth(session.user);
          }
        }
      } else {
        setCurrentUser(null);
        SubscriptionService.clearMemoryCache();
        setAppState('welcome');
      }
    });

    // Écoute des retours Deep Link (bonismusik://payment-success ou payment-cancel)
    const handleDeepLink = async (event) => {
      const url = event?.url;
      if (url && (url.includes('payment-success') || url.includes('success'))) {
        const user = currentUserRef.current || (await supabase.auth.getUser())?.data?.user;
        if (user) {
          await SubscriptionService.activateVipSubscription(user);
        }
        setAppState('payment_success');
      } else if (url && (url.includes('payment-cancel') || url.includes('cancel'))) {
        setAppState('payment_cancel');
      }
    };

    const linkSub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription?.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const handleBackFromAlbum = () => {
    setSelectedAlbum(null);
  };

  // Gestion stricte du retour Paywall : si non abonné, retour à l'écran de bienvenue / connexion
  const handlePaywallBack = async () => {
    if (currentUser) {
      const isSub = await SubscriptionService.isUserSubscribed(currentUser);
      if (isSub) {
        setAppState('main');
        return;
      }
    }
    // Pas abonné -> retour sécurisé à l'accueil onboarding
    setAppState('welcome');
  };

  return (
    <SafeAreaProvider>
      <AudioProvider>
        <View style={styles.container}>
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
              onBack={handlePaywallBack}
              onSuccess={(txId) => {
                if (currentUser) {
                  SubscriptionService.setSubscribedInMemory(currentUser.id, true);
                }
                setLastTxId(txId);
                setAppState('payment_success');
              }}
            />
          )}

          {/* 4. Écran de Confirmation Paiement Réussi */}
          {appState === 'payment_success' && (
            <PaymentSuccessScreen
              txId={lastTxId}
              currentUser={currentUser}
              onContinue={() => {
                setAppState('main');
                setActiveTab('home');
              }}
            />
          )}

          {/* 5. Écran d'Annulation / Échec de Paiement */}
          {appState === 'payment_cancel' && (
            <PaymentCancelScreen
              onRetry={() => setAppState('paywall')}
              onBack={handlePaywallBack}
            />
          )}

          {/* 6. Application Principale (3 Onglets) */}
          {appState === 'main' && (
            <View style={styles.mainContainer}>
              <View style={styles.contentArea}>
                {selectedAlbum ? (
                  <AlbumDetailScreen
                    album={selectedAlbum}
                    currentUser={currentUser}
                    onOpenPaywall={() => setAppState('paywall')}
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
                        currentUser={currentUser}
                        onSelectAlbum={handleSelectAlbum}
                        onSelectClip={() => {}}
                        onSelectTeaching={() => {}}
                        onOpenPaywall={() => setAppState('paywall')}
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
