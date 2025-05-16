import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

type WebPageRouteParams = {
  url: string;
  title?: string;
};

type WebPageRouteProp = RouteProp<{ WebPage: WebPageRouteParams }, 'WebPage'>;

const WebPage = () => {
  const route = useRoute<WebPageRouteProp>();
  const navigation = useNavigation();
  const { url, title } = route.params;
  const [isError, setIsError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M15 18L9 12L15 6" 
              stroke="#000000" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Web Page'}</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.webviewContainer}>
        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No internet connection or unstable connection...</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setIsError(false)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: url }}
            style={styles.webview}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            onError={() => setIsError(true)}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WebPage;
