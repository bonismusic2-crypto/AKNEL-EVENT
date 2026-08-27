import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Crash intercepté par ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={48} color={THEME.colors.gold} />
            </View>

            <Text style={styles.title}>Une petite pause technique</Text>
            <Text style={styles.subtitle}>
              L'application Bonis Musik a rencontré un imprévu mais votre session et vos données restent en sécurité.
            </Text>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={this.handleRestart}
              activeOpacity={0.85}
            >
              <RefreshCw size={18} color="#0D0D0D" />
              <Text style={styles.retryBtnText}>Relancer l'application</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugBox}>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(197, 155, 39, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(197, 155, 39, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: THEME.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: {
    color: '#0D0D0D',
    fontSize: 15,
    fontWeight: '700',
  },
  debugBox: {
    marginTop: 24,
    maxHeight: 120,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  debugText: {
    color: '#EF4444',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
