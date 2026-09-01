import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import { ThemeProvider, useAppTheme } from './src/constants/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BottomNavigation } from './src/components/BottomNavigation';
import { MiniPlayer } from './src/components/MiniPlayer';
import { FullAudioPlayerModal } from './src/components/FullAudioPlayerModal';
import { YouTubeStyleVideoPlayer } from './src/components/YouTubeStyleVideoPlayer';
import { supabase } from './src/lib/supabase';
import { SubscriptionService } from './src/services/subscriptionService';
import { DownloadService } from './src/services/downloadService';
import { SAMPLE_DATA } from './src/data/sampleData';

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
import { MeditationScreen } from './src/screens/MeditationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'auth', 'paywall', 'payment_success', 'payment_cancel', 'main'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'library', 'profile'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastTxId, setLastTxId] = useState(null);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');

  // États pour le Lecteur Vidéo YouTube & Mini-Player Flottant (PiP)
  const [activeVideo, setActiveVideo] = useState(null);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [isVideoFloating, setIsVideoFloating] = useState(false);
  const [downloadedVideoIds, setDownloadedVideoIds] = useState(new Set());

  // Refs pour éviter les fermetures obsolètes (stale closures)
  const appStateRef = useRef(appState);
  appStateRef.current = appState;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Charger les téléchargements réels pour les badges d'état
  const refreshDownloads = async () => {
    const list = await DownloadService.getDownloads();
    setDownloadedVideoIds(new Set(list.map((d) => String(d.id))));
  };

  useEffect(() => {
    refreshDownloads();
  }, []);

  // Fonction de lancement de vidéo YouTube
  const handlePlayVideo = (video) => {
    setActiveVideo(video);
    setIsVideoPlayerVisible(true);
    setIsVideoFloating(false);
  };

  // Basculer le téléchargement d'une vidéo
  const handleToggleDownloadVideo = async (video) => {
    await DownloadService.toggleDownload(video);
    await refreshDownloads();
  };

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

  const handlePaywallBack = () => {
    if (currentUser) {
      SubscriptionService.isUserSubscribed(currentUser).then((isSub) => {
        if (isSub) {
          setAppState('main');
        } else {
          setAppState('welcome');
        }
      });
    } else {
      setAppState('welcome');
    }
  };

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AudioProvider>
            <MainContent
              appState={appState}
              setAppState={setAppState}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedAlbum={selectedAlbum}
              setSelectedAlbum={setSelectedAlbum}
              selectedMeditation={selectedMeditation}
              setSelectedMeditation={setSelectedMeditation}
              isSettingsVisible={isSettingsVisible}
              setIsSettingsVisible={setIsSettingsVisible}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              lastTxId={lastTxId}
              setLastTxId={setLastTxId}
              selectedPlanType={selectedPlanType}
              setSelectedPlanType={setSelectedPlanType}
              activeVideo={activeVideo}
              setActiveVideo={setActiveVideo}
              isVideoPlayerVisible={isVideoPlayerVisible}
              setIsVideoPlayerVisible={setIsVideoPlayerVisible}
              isVideoFloating={isVideoFloating}
              setIsVideoFloating={setIsVideoFloating}
              downloadedVideoIds={downloadedVideoIds}
              refreshDownloads={refreshDownloads}
              handlePlayVideo={handlePlayVideo}
              handleToggleDownloadVideo={handleToggleDownloadVideo}
              handleSelectAlbum={handleSelectAlbum}
              handleBackFromAlbum={handleBackFromAlbum}
              handlePaywallBack={handlePaywallBack}
              routeUserAfterAuth={routeUserAfterAuth}
            />
          </AudioProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const MainContent = ({
  appState,
  setAppState,
  activeTab,
  setActiveTab,
  selectedAlbum,
  setSelectedAlbum,
  selectedMeditation,
  setSelectedMeditation,
  currentUser,
  setCurrentUser,
  lastTxId,
  setLastTxId,
  selectedPlanType,
  setSelectedPlanType,
  activeVideo,
  setActiveVideo,
  isVideoPlayerVisible,
  setIsVideoPlayerVisible,
  isVideoFloating,
  setIsVideoFloating,
  downloadedVideoIds,
  refreshDownloads,
  handlePlayVideo,
  handleToggleDownloadVideo,
  handleSelectAlbum,
  handleBackFromAlbum,
  handlePaywallBack,
  routeUserAfterAuth,
}) => {
  const { theme, isDarkMode } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

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

      {/* 3. Écran d'Abonnement GeniusPay */}
      {appState === 'paywall' && (
        <PaywallScreen
          currentUser={currentUser}
          onBack={handlePaywallBack}
          onSuccess={(txId, planType = 'monthly') => {
            if (currentUser) {
              SubscriptionService.setSubscribedPermanently(
                currentUser.id,
                true,
                planType === 'annual'
                  ? 'Abonnement Annuel (10 000 FCFA = 15,00 €)'
                  : 'Abonnement Mensuel (1 000 FCFA = 1,50 €)',
                null,
                planType
              );
            }
            setLastTxId(txId);
            setSelectedPlanType(planType);
            setAppState('payment_success');
          }}
        />
      )}

      {/* 4. Écran de Confirmation Paiement Réussi */}
      {appState === 'payment_success' && (
        <PaymentSuccessScreen
          txId={lastTxId}
          planType={selectedPlanType}
          onContinue={() => setAppState('main')}
        />
      )}

      {/* 5. Écran d'Annulation Paiement */}
      {appState === 'payment_cancel' && (
        <PaymentCancelScreen
          onRetry={() => setAppState('paywall')}
          onHome={() => setAppState('main')}
        />
      )}

      {/* 6. Application Principale (3 Onglets Navigation & Écrans Dédiés) */}
      {appState === 'main' && (
        <View style={styles.mainContainer}>
          <View style={styles.contentArea}>
            {selectedAlbum ? (
              <AlbumDetailScreen
                album={selectedAlbum}
                currentUser={currentUser}
                onOpenPaywall={() => setAppState('paywall')}
                onBack={handleBackFromAlbum}
                onPlayVideo={handlePlayVideo}
              />
            ) : selectedMeditation ? (
              <MeditationScreen
                meditation={selectedMeditation}
                onBack={() => setSelectedMeditation(null)}
              />
            ) : isSettingsVisible ? (
              <SettingsScreen
                onBack={() => setIsSettingsVisible(false)}
              />
            ) : (
              <>
                {/* Onglet 1 : ACCUEIL */}
                {activeTab === 'home' && (
                  <HomeScreen
                    currentUser={currentUser}
                    onSelectAlbum={handleSelectAlbum}
                    onSelectClip={handlePlayVideo}
                    onSelectTeaching={(teaching) => {
                      if (teaching?.type === 'video' || teaching?.videoUrl) {
                        handlePlayVideo(teaching);
                      } else {
                        setActiveTab('library');
                      }
                    }}
                    onOpenProfile={() => setActiveTab('profile')}
                    onOpenPaywall={() => setAppState('paywall')}
                    onOpenMeditation={(med) => setSelectedMeditation(med)}
                  />
                )}

                {/* Onglet 2 : MÉDIATHÈQUE UNIFIÉE (Musique, Clips & Enseignements) */}
                {activeTab === 'library' && (
                  <MediaLibraryScreen
                    onSelectAlbum={handleSelectAlbum}
                    onSelectClip={handlePlayVideo}
                    onSelectTeaching={(teaching) => {
                      if (teaching?.type === 'video' || teaching?.videoUrl) {
                        handlePlayVideo(teaching);
                      }
                    }}
                    currentUser={currentUser}
                    onOpenPaywall={() => setAppState('paywall')}
                  />
                )}

                {/* Onglet 3 : PROFIL & GESTION ABONNEMENT */}
                {activeTab === 'profile' && (
                  <ProfileScreen
                    currentUser={currentUser}
                    onOpenPaywall={() => setAppState('paywall')}
                    onOpenSettings={() => setIsSettingsVisible(true)}
                    onPlayVideo={handlePlayVideo}
                    onLogout={async () => {
                      await supabase.auth.signOut();
                      setCurrentUser(null);
                      setAppState('welcome');
                    }}
                  />
                )}
              </>
            )}
          </View>

          {/* Lecteur Audio Mini Persistant */}
          {!isVideoPlayerVisible && <MiniPlayer />}

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

          {/* Lecteur Vidéo YouTube & Mini-Player Flottant (Picture-in-Picture) */}
          <YouTubeStyleVideoPlayer
            video={activeVideo}
            visible={isVideoPlayerVisible}
            isFloating={isVideoFloating}
            onClose={() => {
              setIsVideoPlayerVisible(false);
              setIsVideoFloating(false);
              setActiveVideo(null);
            }}
            onMinimize={() => setIsVideoFloating(true)}
            onMaximize={() => setIsVideoFloating(false)}
            isDownloaded={activeVideo ? downloadedVideoIds.has(String(activeVideo.id)) : false}
            onToggleDownload={handleToggleDownloadVideo}
            suggestedVideos={SAMPLE_DATA.videoClips}
            onSelectVideo={handlePlayVideo}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0D0D0D',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
});
