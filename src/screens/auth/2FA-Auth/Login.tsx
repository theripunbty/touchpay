import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { TermsScreenNavigationProp } from '../../../types/navigation';
import { authService } from '../../../utils/apiService';

const Login = () => {
  const navigation = useNavigation<TermsScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get current device dimensions
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive sizing factors
  const isTablet = width > 768;
  const isSmallPhone = width < 375;
  const isLargePhone = width >= 414 && width < 768;
  
  // Base scaling factor
  const scale = Math.min(width / 375, height / 812);
  const fontScale = Math.max(0.85, Math.min(scale * (isTablet ? 1.1 : 1), 1.3));

  // Responsive styles
  const responsiveStyles = {
    headerPadding: {
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.01,
      marginBottom: height * 0.025,
    },
    backButton: {
      width: Math.max(36, 40 * scale),
      height: Math.max(36, 40 * scale),
      borderRadius: Math.max(18, 20 * scale),
    },
    title: {
      fontSize: Math.min(32, Math.max(24, 28 * fontScale)),
      marginBottom: height * 0.01,
    },
    subtitle: {
      fontSize: Math.max(13, 14 * fontScale),
      lineHeight: Math.max(19, 20 * fontScale), 
    },
    phoneInputContainer: {
      height: Math.max(56, Math.min(60 * scale, 70)),
      borderRadius: Math.max(10, 12 * scale),
      marginBottom: height * 0.015,
    },
    phoneInput: {
      fontSize: Math.max(16, 18 * fontScale),
    },
    countryCode: {
      fontSize: Math.max(15, 16 * fontScale),
    },
    errorText: {
      fontSize: Math.max(11, 12 * fontScale),
    },
    formContainer: {
      paddingHorizontal: width * 0.06,
    },
    infoSectionText: {
      fontSize: Math.max(11, 12 * fontScale),
    },
    buttonContainer: {
      paddingHorizontal: width * 0.06,
      paddingBottom: isTablet ? height * 0.05 : height * 0.04,
    },
    continueButton: {
      height: Math.max(50, Math.min(56 * scale, 65)),
      borderRadius: Math.max(25, Math.min(28 * scale, 32)),
      marginBottom: height * 0.02,
    },
    buttonText: {
      fontSize: Math.max(15, 16 * fontScale),
    },
    svgIcon: {
      width: Math.max(16, 18 * scale),
      height: Math.max(16, 18 * scale),
    },
    arrowContainer: {
      width: Math.max(28, 32 * scale),
      height: Math.max(28, 32 * scale),
      borderRadius: Math.max(14, 16 * scale),
    },
    titleContainer: {
      marginTop: height * (isTablet ? 0.07 : isSmallPhone ? 0.03 : 0.04),
      marginBottom: height * (isTablet ? 0.04 : 0.03),
    },
    signUpContainer: {
      paddingVertical: height * 0.01,
    },
    signUpText: {
      fontSize: Math.max(13, 14 * fontScale),
    },
    signUpActionText: {
      fontSize: Math.max(13, 14 * fontScale),
      fontWeight: "600" as const,
    }
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.timing(inputFocusAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.timing(inputFocusAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Start animations when component mounts
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validate phone number
  useEffect(() => {
    // Indian phone number validation (10 digits)
    const isValid = /^[6-9]\d{9}$/.test(phoneNumber);
    setIsPhoneValid(isValid);

    // Clear error when user types
    if (error) setError('');
  }, [phoneNumber]);

  const handlePhoneNumberChange = (text: string) => {
    // Only allow numbers and limit to 10 digits
    const formattedText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(formattedText);
  };

  const handleContinue = async () => {
    if (isPhoneValid && !loading) {
      try {
        // Set loading state
        setLoading(true);
        setError('');
        
        // Request OTP for the phone number
        const otpResponse = await authService.requestOTP(phoneNumber);
        
        if (otpResponse.success) {
          // Navigate to OTP verification screen with only the phoneNumber parameter
          navigation.navigate('OTPVerify', { phoneNumber });
        } else {
          // Show error
          setError(otpResponse.message || 'Failed to send verification code');
        }
      } catch (err) {
        setError('Failed to send verification code. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Terms');
  };

  // Format phone number with spaces for better readability
  const formattedPhoneNumber = () => {
    if (!phoneNumber) return '';
    if (phoneNumber.length <= 5) {
      return phoneNumber;
    }
    return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <Svg height={height} width={width} style={styles.backgroundSvg}>
          <Defs>
            <LinearGradient id="gradCircle1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0045EB" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#00A3FF" stopOpacity="0.25" />
            </LinearGradient>
            <LinearGradient id="gradCircle2" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#07C8F9" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#0052D4" stopOpacity="0.25" />
            </LinearGradient>
            <LinearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#00A3FF" stopOpacity="0" />
              <Stop offset="50%" stopColor="#00A3FF" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#00A3FF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* Enhanced decorative elements */}
          <Circle cx={width * 0.85} cy={height * 0.15} r={Math.min(120, width * 0.25)} fill="url(#gradCircle1)" />
          <Circle cx={width * 0.1} cy={height * 0.85} r={Math.min(150, width * 0.3)} fill="url(#gradCircle2)" />
          
          {/* Horizontal accent line */}
          <Rect x="0" y={height * 0.3} width={width} height="1.5" fill="url(#gradLine)" />
          
          {/* Enhanced grid pattern */}
          <G opacity="0.4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Path
                key={`horizontal-${i}`}
                d={`M0,${height * (i / 15 + 0.1)} L${width},${height * (i / 15 + 0.1)}`}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <Path
                key={`vertical-${i}`}
                d={`M${width * (i / 7)},0 L${width * (i / 7)},${height}`}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            ))}
          </G>
          
          {/* Digital finance decoration */}
          <G opacity="0.1">
            <Path 
              d={`M${width * 0.2},${height * 0.65} L${width * 0.3},${height * 0.6} L${width * 0.4},${height * 0.63} L${width * 0.5},${height * 0.58}`}
              stroke="#00A3FF"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <Circle cx={width * 0.2} cy={height * 0.65} r="4" fill="#00A3FF" />
            <Circle cx={width * 0.5} cy={height * 0.58} r="4" fill="#00A3FF" />
          </G>
        </Svg>
      </View>

      {/* Header */}
      <View style={[styles.header, responsiveStyles.headerPadding]}>
        <TouchableOpacity 
          style={[styles.backButton, responsiveStyles.backButton]}
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
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.formContainer, responsiveStyles.formContainer]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Title and Description */}
        <Animated.View 
          style={[
            styles.titleContainer,
            responsiveStyles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={[styles.title, responsiveStyles.title]}>WELCOME BACK</Text>
          <Text style={[styles.subtitle, responsiveStyles.subtitle]}>Enter your mobile number to login to your account</Text>
        </Animated.View>

        {/* Inputs */}
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }]
            }
          ]}
        >
          {/* Phone Input */}
          <View style={[
            styles.phoneInputContainer, 
            responsiveStyles.phoneInputContainer,
            error ? styles.phoneInputContainerError : null
          ]}>
            {/* Country Code */}
            <View style={styles.countryCodeContainer}>
              <Text style={[styles.countryCode, responsiveStyles.countryCode]}>+91</Text>
              <View style={styles.divider} />
            </View>
            
            {/* Phone Number Input */}
            <TextInput
              style={[styles.phoneInput, responsiveStyles.phoneInput]}
              value={formattedPhoneNumber()}
              onChangeText={handlePhoneNumberChange}
              placeholder="mobile number"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="phone-pad"
              maxLength={11} // To account for the space
              editable={!loading}
            />
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, responsiveStyles.errorText]}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {!isKeyboardVisible && (
          <Animated.View
            style={[
              styles.infoSection,
              {
                opacity: Animated.multiply(fadeAnim, 0.85),
                transform: [{ translateY: Animated.multiply(slideAnim, 1.3) }]
              }
            ]}
          >
            <View style={styles.infoRow}>
              <Svg width={responsiveStyles.svgIcon.width} height={responsiveStyles.svgIcon.height} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 16V12"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 8H12.01"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.infoText, responsiveStyles.infoSectionText]}>Use your bank-linked mobile number for UPI services.</Text>
            </View>
            <View style={styles.infoRow}>
              <Svg width={responsiveStyles.svgIcon.width} height={responsiveStyles.svgIcon.height} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 16V12"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 8H12.01"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.infoText, responsiveStyles.infoSectionText]}>Keep your phone password protected and don't share them.</Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Continue Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          responsiveStyles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: isKeyboardVisible 
              ? [{ translateY: inputFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20 * scale]
                })}] 
              : [{ translateY: 0 }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            responsiveStyles.continueButton,
            isPhoneValid ? styles.activeButton : styles.inactiveButton,
            loading && styles.loadingButton
          ]}
          onPress={handleContinue}
          disabled={!isPhoneValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={isPhoneValid ? "#000000" : "#FFFFFF"} />
          ) : (
            <>
              <Text style={[
                styles.buttonText, 
                responsiveStyles.buttonText,
                isPhoneValid ? styles.activeButtonText : styles.inactiveButtonText
              ]}>
                Continue
              </Text>
              <View style={[
                styles.arrowContainer,
                responsiveStyles.arrowContainer,
                isPhoneValid ? styles.activeArrowContainer : styles.inactiveArrowContainer
              ]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    stroke={isPhoneValid ? "#000000" : "rgba(255,255,255,0.5)"} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Sign Up Option */}
        <View style={[styles.signUpContainer, responsiveStyles.signUpContainer]}>
          <Text style={[styles.signUpText, responsiveStyles.signUpText]}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={[styles.signUpActionText, responsiveStyles.signUpActionText]}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: StatusBar.currentHeight,
  },
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundSvg: {
    position: 'absolute',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleContainer: {
    justifyContent: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 6,
  },
  phoneInputContainerError: {
    borderColor: '#FF3B30',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  countryCode: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    width: 1.5,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    color: '#FFFFFF',
    padding: 0,
    letterSpacing: 0.5,
  },
  errorContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#999999',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 10,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
  },
  inactiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  loadingButton: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: '600',
    marginRight: 8,
  },
  activeButtonText: {
    color: '#000000',
  },
  inactiveButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeArrowContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  inactiveArrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  signUpActionText: {
    color: '#00A3FF',
    marginLeft: 4,
  },
});

export default Login; 