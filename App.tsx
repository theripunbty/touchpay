import React, { ErrorInfo, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text, StyleSheet, Appearance, StatusBar } from 'react-native';

// Error boundary component to catch and display rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff6666',
    textAlign: 'center',
  },
});

const App = () => {
  // Force dark mode
  useEffect(() => {
    // Set preferred color scheme to dark
    Appearance.setColorScheme('dark');
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <AppNavigator />
    </ErrorBoundary>
  );
};

export default App; 