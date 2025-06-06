import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import type { SplashScreenNavigationProp } from '../../types/navigation';
import Logo from '../../assets/logos/touchpay.svg';

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive scaling factors
  const baseWidth = 375; // Standard iPhone width
  const baseHeight = 812; // Standard iPhone height
  const scale = Math.min(width / baseWidth, height / baseHeight);
  
  // Responsive logo size with min/max constraints - make logo bigger
  const logoSize = Math.min(
    Math.max(width * 0.65, 200), 
    Math.min(width * 0.85, height * 0.85, 500)
  );
  
  useEffect(() => {
    // Reference for the timer to clean up on unmount
    const timerRef = { current: null as NodeJS.Timeout | null };
    
    // Start animations first
    const startAnimations = () => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
      
      // After delay, fade out and navigate
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace('ClientAuth');
        });
      }, 1000);
      
      timerRef.current = timer;
    };
    
    // Start animations immediately
    startAnimations();
    
    // Cleanup function
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9 * scale, 1 * scale]
            }) }]
          }
        ]}
      >
        <Logo width={logoSize} height={logoSize} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SplashScreen;