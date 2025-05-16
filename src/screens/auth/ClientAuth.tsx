import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  StatusBar,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StartLogo from '../../assets/logos/start-logo.svg';
import { useNavigation } from '@react-navigation/native';
import { ClientAuthScreenNavigationProp } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

const ClientAuth = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Background curved lines - fullscreen */}
      <View style={styles.backgroundContainer}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
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
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim
            }
          ]}
        >
          <StartLogo width={150} height={60} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.textContainer, 
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headingText}>
            Your Money,{'\n'}Your Control
          </Text>
          <View style={styles.separator} />
          <Text style={styles.subheadingText}>
            Anytime,{'\n'}Anywhere.
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: buttonFadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() => {
              Vibration.vibrate(50);
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
            activeOpacity={0.8}
            onPress={() => {
              Vibration.vibrate(50);
              navigation.navigate('Terms');
            }}
          >
            <Text style={styles.signupButtonText}>Get Started</Text>
            <View style={styles.signupArrowContainer}>
              <Text style={styles.arrowIconDark}>→</Text>
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
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 30,
    zIndex: 1,
  },
  textContainer: {
    marginTop: height * 0.15,
  },
  headingText: {
    color: 'white',
    fontSize: 46,
    fontWeight: '700',
    lineHeight: 52,
  },
  separator: {
    width: 40,
    height: 5,
    backgroundColor: 'white',
    marginVertical: 20,
    marginLeft: 10,
    marginTop: 30,
  },
  subheadingText: {
    color: 'white',
    fontSize: 46,
    fontWeight: '700',
    lineHeight: 52,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingLeft: 24,
    paddingRight: 16,
    width: '42%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingLeft: 24,
    paddingRight: 16,
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
    fontSize: 16,
    fontWeight: '600',
  },
  signupArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  arrowIconDark: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClientAuth;

