import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { RootStackParamList, VerifyLinkingScreenNavigationProp } from '../../../../types/navigation';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

type VerifyLinkingRouteProp = RouteProp<RootStackParamList, 'VerifyLinking'>;

const VerifyLinking = () => {
  const navigation = useNavigation<VerifyLinkingScreenNavigationProp>();
  const route = useRoute<VerifyLinkingRouteProp>();
  
  const { bankName, accountId, maskedAccountNumber, ifsc, accRefNumber } = route.params || {
    bankName: 'Your Bank',
    accountId: '',
    maskedAccountNumber: 'XXXX-XXXX-XXXX',
    ifsc: '',
    accRefNumber: ''
  };

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Smooth spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Smooth progress animation with easing
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 4500,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // Simulate completion after animation finishes
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient 
      colors={['#0F0F2D', '#0F0F2D']} 
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0F2D" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M15 18L9 12L15 6" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Verification</Text>
        <View style={{width: 24}} />
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Verification Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Verifying...</Text>
          <Text style={styles.statusSubtitle}>This usually takes less than 30 seconds</Text>
          
          {/* Additional smooth progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

// Create an animated version of the Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -60,
    marginBottom: 8,
  },
  statusSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 24,
  },
  progressContainer: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
});

export default VerifyLinking;