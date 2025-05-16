import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { OTPVerifyScreenNavigationProp } from '../../../../types/navigation';
import { authService } from '../../../../utils/apiService';

type OTPVerifyRouteProps = RouteProp<{
  params: {
    phoneNumber: string;
  };
}, 'params'>;

const { width, height } = Dimensions.get('window');

const OTPVerify = () => {
  const navigation = useNavigation<OTPVerifyScreenNavigationProp>();
  const route = useRoute<OTPVerifyRouteProps>();
  
  // Default to empty string if not provided
  const phoneNumber = route.params?.phoneNumber || '';
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

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
    
    // Focus first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Verify if OTP is complete (all 6 digits filled)
  const isOtpComplete = otp.every(digit => digit !== '');

  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    // Clear error when user types
    if (error) setError('');
    
    // Only allow numbers
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      
      // If user has entered a digit and it's not the last input, move to next input
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (canResend && phoneNumber) {
      try {
        // Set loading state
        setLoading(true);
        setError('');
        
        // Call API to resend OTP
        const response = await authService.requestOTP(phoneNumber);
        
        if (response.success) {
          // Reset timer and canResend state
          setTimer(30);
          setCanResend(false);
          
          // Clear OTP inputs
          setOtp(['', '', '', '', '', '']);
          
          // Focus first input
          inputRefs.current[0]?.focus();
          
          // Show success message
          
          // In development, we might get the OTP back from the API
          if (__DEV__ && response.otp) {
          }
        } else {
          // Show error
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to resend OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle verify button press
  const handleVerify = async () => {
    if (isOtpComplete && !loading) {
      try {
        // Set loading state
        setLoading(true);
        setError('');
        
        const otpString = otp.join('');
        
        // Call API to verify OTP
        const response = await authService.verifyOTP(phoneNumber, otpString);
        
        if (response.success) {
          // Navigate to the LinkAccounts screen on success
          navigation.navigate('LinkAccounts');
        } else {
          // Show error
          setError(response.message);
          
          // Clear OTP inputs for retry
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } catch (err) {
        setError('Failed to verify OTP. Please try again.');
        
        // Clear OTP inputs for retry
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    }
  };

  // Mask phone number for display
  const maskedPhone = phoneNumber ? 
    `+91 ${phoneNumber.substring(0, 2)}******${phoneNumber.substring(phoneNumber.length - 2)}` : 
    '+91 ********';

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
          <Circle cx={width * 0.85} cy={height * 0.15} r="120" fill="url(#gradCircle1)" />
          <Circle cx={width * 0.1} cy={height * 0.85} r="150" fill="url(#gradCircle2)" />
          
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
      <View style={styles.header}>
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
        <View style={styles.stepIndicatorContainer}>
          <Text style={styles.stepIndicator}>Step 2 of 3</Text>
          <View style={styles.stepProgressContainer}>
            <View style={styles.stepProgressActive} />
            <View style={styles.stepProgressActive} />
            <View style={styles.stepProgressInactive} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        {/* Title and Description */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.title}>VERIFY ACCOUNT</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit code to {maskedPhone}</Text>
        </Animated.View>

        {/* OTP Input */}
        <Animated.View 
          style={[
            styles.otpContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }]
            }
          ]}
        >
          <View style={styles.otpInputRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <View 
                key={index} 
                style={[
                  styles.otpInputBox,
                  otp[index] ? styles.otpInputBoxFilled : null,
                  error ? styles.otpInputBoxError : null
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  caretHidden
                  selectionColor="#00A3FF"
                  editable={!loading}
                />
              </View>
            ))}
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Resend code option */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code? 
            </Text>
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={!canResend || loading}
            >
              <Text style={[
                styles.resendActionText,
                (!canResend || loading) && styles.resendDisabled
              ]}>
                {loading && !canResend ? 'Sending...' : 
                 canResend ? 'Resend' : `Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </View>
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
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
              <Text style={styles.infoText}>The code will expire in 5 minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
              <Text style={styles.infoText}>Enter the code exactly as received</Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Verify Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: isKeyboardVisible 
              ? [{ translateY: inputFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })}] 
              : [{ translateY: 0 }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.verifyButton, 
            isOtpComplete ? styles.activeButton : styles.inactiveButton,
            loading && styles.loadingButton
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={isOtpComplete ? "#000000" : "#FFFFFF"} />
          ) : (
            <>
              <Text style={[
                styles.buttonText, 
                isOtpComplete ? styles.activeButtonText : styles.inactiveButtonText
              ]}>
                Verify
              </Text>
              <View style={[
                styles.arrowContainer,
                isOtpComplete ? styles.activeArrowContainer : styles.inactiveArrowContainer
              ]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    stroke={isOtpComplete ? "#000000" : "rgba(255,255,255,0.5)"} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </>
          )}
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepIndicatorContainer: {
    alignItems: 'flex-end',
  },
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  stepProgressContainer: {
    flexDirection: 'row',
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepProgressActive: {
    flex: 1,
    backgroundColor: '#98144D',
  },
  stepProgressInactive: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  titleContainer: {
    marginTop: height * 0.04,
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpInputBox: {
    width: width / 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputBoxFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpInputBoxError: {
    borderColor: '#FF3B30',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  resendActionText: {
    color: '#00A3FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  resendDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoSection: {
    marginTop: 20,
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
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
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
    fontSize: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeArrowContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  inactiveArrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default OTPVerify;
