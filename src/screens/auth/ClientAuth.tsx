import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Animated,
  StatusBar,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StartLogo from '../../assets/logos/start-logo.svg';
import { useNavigation } from '@react-navigation/native';
import { ClientAuthScreenNavigationProp } from '../../types/navigation';

const ClientAuth = () => {
  // Get dimensions using hook instead of static Dimensions
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive scaling factors
  const baseWidth = 375; // Standard iPhone width
  const baseHeight = 812; // Standard iPhone height
  const scale = Math.min(width / baseWidth, height / baseHeight);
  
  // Calculate font sizes based on device scale
  const fontScale = Math.max(0.8, Math.min(scale, 1.3)); // Limit scaling between 0.8 and 1.3
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const buttonFadeAnim = new Animated.Value(0);
  const logoFadeAnim = new Animated.Value(0);

  const navigation = useNavigation<ClientAuthScreenNavigationProp>();

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Dynamically generate SVG paths based on current screen dimensions
  const generateSvgPaths = () => {
    return (
      <>
        <Path
          d={`M0,${height * 0.1} Q${width * 0.2},${height * 0.05} ${width * 0.4},${height * 0.15} T${width * 0.8},${height * 0.1} T${width},${height * 0.2}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M0,${height * 0.3} Q${width * 0.25},${height * 0.2} ${width * 0.4},${height * 0.3} T${width * 0.8},${height * 0.25} T${width},${height * 0.35}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M0,${height * 0.5} Q${width * 0.15},${height * 0.4} ${width * 0.3},${height * 0.45} T${width * 0.7},${height * 0.4} T${width},${height * 0.45}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M0,${height * 0.7} Q${width * 0.2},${height * 0.6} ${width * 0.4},${height * 0.65} T${width * 0.8},${height * 0.6} T${width},${height * 0.7}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M0,${height * 0.9} Q${width * 0.25},${height * 0.8} ${width * 0.4},${height * 0.85} T${width * 0.8},${height * 0.8} T${width},${height * 0.9}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M${width * 0.2},0 Q${width * 0.3},${height * 0.2} ${width * 0.2},${height * 0.4} T${width * 0.25},${height * 0.8} T${width * 0.2},${height}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <Path
          d={`M${width * 0.6},0 Q${width * 0.7},${height * 0.2} ${width * 0.6},${height * 0.4} T${width * 0.65},${height * 0.8} T${width * 0.6},${height}`}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
      </>
    );
  };

  // Calculate dynamic styles based on screen dimensions
  const dynamicStyles = {
    logoSize: {
      width: Math.min(150 * fontScale, width * 0.4),
      height: Math.min(60 * fontScale, height * 0.1)
    },
    headingText: {
      fontSize: Math.min(46 * fontScale, width * 0.12),
      lineHeight: Math.min(52 * fontScale, width * 0.14),
    },
    subheadingText: {
      fontSize: Math.min(46 * fontScale, width * 0.12),
      lineHeight: Math.min(52 * fontScale, width * 0.14),
    },
    separator: {
      width: 40 * fontScale,
      height: 5 * fontScale,
      marginVertical: 20 * fontScale,
      marginLeft: 10 * fontScale,
      marginTop: 30 * fontScale,
    },
    textContainer: {
      marginTop: height * 0.15,
    },
    buttonContainer: {
      marginBottom: 30 * fontScale,
    },
    button: {
      paddingVertical: Math.max(12, 15 * fontScale),
      paddingLeft: 24 * fontScale,
      paddingRight: 16 * fontScale,
    },
    buttonText: {
      fontSize: Math.min(16 * fontScale, width * 0.045),
    },
    arrowContainer: {
      width: 28 * fontScale,
      height: 28 * fontScale,
      borderRadius: 14 * fontScale,
    },
    arrowIcon: {
      fontSize: 16 * fontScale,
    },
    contentPadding: {
      paddingHorizontal: width * 0.08,
      paddingVertical: height * 0.05,
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background curved lines - fullscreen */}
      <View style={styles.backgroundContainer}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
          {generateSvgPaths()}
        </Svg>
      </View>

      {/* Content */}
      <View style={[styles.contentContainer, dynamicStyles.contentPadding]}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim
            }
          ]}
        >
          <StartLogo width={dynamicStyles.logoSize.width} height={dynamicStyles.logoSize.height} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.textContainer, 
            dynamicStyles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.headingText, dynamicStyles.headingText]}>
            Your Money,{'\n'}Your Control
          </Text>
          <View style={[styles.separator, dynamicStyles.separator]} />
          <Text style={[styles.subheadingText, dynamicStyles.subheadingText]}>
            Anytime,{'\n'}Anywhere.
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            dynamicStyles.buttonContainer,
            { opacity: buttonFadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={[styles.loginButton, dynamicStyles.button]}
            activeOpacity={0.8}
            onPress={() => {
              Vibration.vibrate(50);
              navigation.navigate('Login');
            }}
          >
            <Text style={[styles.loginButtonText, dynamicStyles.buttonText]}>Log in</Text>
            <View style={[styles.arrowContainer, dynamicStyles.arrowContainer]}>
              <Text style={[styles.arrowIcon, dynamicStyles.arrowIcon]}>→</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.signupButton, dynamicStyles.button]}
            activeOpacity={0.8}
            onPress={() => {
              Vibration.vibrate(50);
              navigation.navigate('Terms');
            }}
          >
            <Text style={[styles.signupButtonText, dynamicStyles.buttonText]}>Get Started</Text>
            <View style={[styles.signupArrowContainer, dynamicStyles.arrowContainer]}>
              <Text style={[styles.arrowIconDark, dynamicStyles.arrowIcon]}>→</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: StatusBar.currentHeight,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 30,
    zIndex: 1,
  },
  textContainer: {
    // Responsive values will be added dynamically
  },
  headingText: {
    color: 'white',
    fontWeight: '700',
  },
  separator: {
    backgroundColor: 'white',
  },
  subheadingText: {
    color: 'white',
    fontWeight: '700',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '42%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  arrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    color: 'white',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '52%',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  signupArrowContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  arrowIconDark: {
    color: 'black',
    fontWeight: '600',
  },
});

export default ClientAuth;

