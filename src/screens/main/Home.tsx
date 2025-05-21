import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  AppState,
  AppStateStatus,
  useColorScheme,
  Image,
  Animated,
  Easing,
  Platform,
  PixelRatio,
  ScaledSize,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';
import GridBackground from '@components/GridBackground';
import { SvgXml } from 'react-native-svg';
import CheckBalanceSheet from '@components/CheckBalanceSheet';

interface Props {
  navigation: HomeScreenNavigationProp
}

// Get the screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base width and height that UI was designed for
const baseWidth = 375;
const baseHeight = 812;

// Scale factors for horizontal and vertical dimensions
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Function to scale size based on screen width
const wp = (size: number) => {
  return PixelRatio.roundToNearestPixel(size * widthScale);
};

// Function to scale size based on screen height
const hp = (size: number) => {
  return PixelRatio.roundToNearestPixel(size * heightScale);
};

// Function to scale font sizes for better readability across devices
const getFontSize = (size: number) => {
  // Smaller scale factor for fonts to prevent too large text on larger screens
  const fontScale = Math.min(widthScale, heightScale);
  const scaledSize = size * fontScale;
  // Set min and max boundaries for font sizes
  return Math.min(Math.max(scaledSize, size * 0.8), size * 1.2);
};

// UPI SVG logo
const upiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 466" id="upi">
  <path fill="#3d3d3c" d="M98.1 340.7h6.3l-5.9 24.5c-.9 3.6-.7 6.4.5 8.2 1.2 1.8 3.4 2.7 6.7 2.7 3.2 0 5.9-.9 8-2.7 2.1-1.8 3.5-4.6 4.4-8.2l5.9-24.5h6.4l-6 25.1c-1.3 5.4-3.6 9.5-7 12.2-3.3 2.7-7.7 4.1-13.1 4.1-5.4 0-9.1-1.3-11.1-4s-2.4-6.8-1.1-12.2l6-25.2zm31.4 40.3 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm44.2 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10h15.5l-1.4 5.7h-15.5l-4.5 18.9h-6.4zm29 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13H257l-1.4 5.9h-21.9zm29.3 0 9.6-40.3h8.6c5.6 0 9.5.3 11.6.9 2.1.6 3.9 1.5 5.3 2.9 1.8 1.8 3 4.1 3.5 6.8.5 2.8.3 6-.5 9.5-.9 3.6-2.2 6.7-4 9.5-1.8 2.8-4.1 5-6.8 6.8-2 1.4-4.2 2.3-6.6 2.9-2.3.6-5.8.9-10.4.9H263z"></path>
  <path fill="#70706e" d="M740.7 305.6h-43.9l61-220.3h43.9l-61 220.3zM717.9 92.2c-3-4.2-7.7-6.3-14.1-6.3H462.6l-11.9 43.2h219.4l-12.8 46.1H481.8v-.1h-43.9l-36.4 131.5h43.9l24.4-88.2h197.3c6.2 0 12-2.1 17.4-6.3 5.4-4.2 9-9.4 10.7-15.6l24.4-88.2c1.9-6.6 1.3-11.9-1.7-16.1zm-342 199.6c-2.4 8.7-10.4 14.8-19.4 14.8H130.2c-6.2 0-10.8-2.1-13.8-6.3-3-4.2-3.7-9.4-1.9-15.6l55.2-198.8h43.9l-49.3 177.6h175.6l49.3-177.6h43.9l-57.2 205.9z"></path>
  <path fill="#098041" d="M877.5 85.7 933 196.1 816.3 306.5z"></path>
  <path fill="#e97626" d="M838.5 85.7 894 196.1 777.2 306.5z"></path>
</svg>`;

const Home: React.FC<Props> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [hasPermission, setHasPermission] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [zoomLevel] = useState(3); // Fixed default zoom level
  const [isCameraActive, setIsCameraActive] = useState(false);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const [isAppInForeground, setIsAppInForeground] = useState(true);
  const [isCheckBalanceVisible, setIsCheckBalanceVisible] = useState(false);
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  // Animation value for UPI container
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Animation value for QR button icon pulse effect
  const qrIconPulse = useRef(new Animated.Value(1)).current;

  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 },
    { photoResolution: 'max' }
  ]);

  const camera = useRef<Camera>(null);

  const spendingData = {
    today: {
      amount: '750.00',
      comparison: {
        amount: '180.00',
        percentage: 12,
        trend: 'up'
      }
    },
    yesterday: {
      amount: '183.20',
      comparison: {
        amount: '163.45',
        percentage: 8,
        trend: 'down'
      }
    }
  };

  // Handle dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        setIsAppInForeground(false);
        setIsTorchOn(false);
      } else if (nextAppState === 'active' && appState.current === 'background') {
        setIsAppInForeground(true);
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsTorchOn(false);
      };
    }, [])
  );

  const toggleFlashlight = () => {
    if (isCameraActive && hasPermission) {
      setIsTorchOn(prev => !prev);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectDay = (day: 'today' | 'yesterday') => {
    setSelectedDay(day);
    setIsDropdownOpen(false);
  };

  const getIrraAI = () => {
    navigation.navigate("Support");
  };

  const getTransactions = () => {
    navigation.navigate("Transactions");
  };

  const getNotifications = () => {
    navigation.navigate("Notifications");
  };

  const transferMoney = () => {
    navigation.navigate("SendMoney");
  };

  const requestMoney = () => {
    navigation.navigate("RequestMoney");
  };

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleQRPress = () => {
    setIsCameraActive(prev => {
      if (!prev) {
        // If camera is being turned on, keep current torch state
        return true;
      } else {
        // If camera is being turned off, turn off torch
        setIsTorchOn(false);
        return false;
      }
    });
  };

  const handleQRLongPress = () => {
    // navigation.navigate('QR');
  };

  const handleCheckBalance = () => {
    setIsCheckBalanceVisible(true);
  };

  const handleCloseCheckBalance = () => {
    setIsCheckBalanceVisible(false);
  };

  const handleVerifyBalance = () => {
    // Handle verification logic here
    console.log('Verifying balance...');
  };

  // Add a new function to navigate to UPI Accounts
  const goToUpiAccounts = () => {
    // navigation.navigate('UpiAccounts');
  };

  useEffect(() => {
    // Start the pulse animation for the UPI container
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // QR button pulse animation
  useEffect(() => {
    // Animation sequence for QR icon pulse
    Animated.loop(
      Animated.sequence([
        // Pulse grow
        Animated.timing(qrIconPulse, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Pulse shrink
        Animated.timing(qrIconPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        // Small pause
        Animated.delay(200),
      ])
    ).start();
  }, [qrIconPulse]);

  if (!hasPermission || !device) {
    return null;
  }

  return (
    <GridBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={goToProfile}
          >
            <Image
              source={{ uri: 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1746203887/oliveit/registrations/yuae5vufae2k8uwrtoit.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[
                styles.iconButton,
                (!isCameraActive || !hasPermission) && styles.disabledButton
              ]} 
              onPress={toggleFlashlight}
              disabled={!isCameraActive || !hasPermission}
            >
              <MaterialIcons 
                name={isTorchOn ? "flash-on" : "flash-off"} 
                size={wp(22)} 
                color={(!isCameraActive || !hasPermission) ? "rgba(255,255,255,0.3)" : "#fff"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={getIrraAI}>
              <Ionicons name="chatbubble-ellipses-outline" size={wp(22)} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={getNotifications}>
              <View style={styles.notificationDot} />
              <MaterialIcons name="notifications-none" size={wp(22)} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={getTransactions}>
              <MaterialIcons name="receipt" size={wp(22)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            {/* UPI ID Container */}
            <Animated.View 
              style={[
                styles.upiContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upiGradient}
              >
                <Text style={styles.upiText}>UPI ID: 7002670531@tpay</Text>
                <MaterialIcons name="chevron-right" size={wp(18)} color="#fff" />
              </LinearGradient>
            </Animated.View>

            <TouchableOpacity 
              style={styles.cameraContainer}
              onPress={handleQRPress}
              onLongPress={handleQRLongPress}
              activeOpacity={0.9}
            >
              {isFocused && isAppInForeground && isCameraActive && (
                <Camera
                  ref={camera}
                  style={styles.camera}
                  device={device}
                  format={format}
                  isActive={isFocused && isAppInForeground && isCameraActive}
                  torch={isTorchOn ? 'on' : 'off'}
                  focusable={true}
                  zoom={zoomLevel}
                />
              )}
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <MaterialIcons name="qr-code-scanner" size={wp(36)} color="#fff" />
                </View>
                <Text style={styles.tapToScanText}>Tap to scan</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCheckBalance}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <MaterialIcons name="account-balance" size={wp(18)} color="#fff" />
                  <Text style={styles.actionButtonText}>Check Balance</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("MyContacts")}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <MaterialIcons name="people" size={wp(18)} color="#fff" />
                  <Text style={styles.actionButtonText}>Pay Contacts</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.priceCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.priceCardGradient}
              >
                <View style={styles.priceHeader}>
                  <Text style={styles.priceLabel}>Total Spent</Text>
                  <View>
                    <TouchableOpacity style={styles.todayButton} onPress={toggleDropdown}>
                      <Text style={styles.todayText}>{selectedDay === 'today' ? 'Today' : 'Yesterday'}</Text>
                      <MaterialIcons 
                        name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={wp(18)} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                    {isDropdownOpen && (
                      <View style={styles.dropdown}>
                        <TouchableOpacity 
                          style={styles.dropdownItem} 
                          onPress={() => selectDay('today')}
                        >
                          <Text style={[styles.dropdownText, selectedDay === 'today' && styles.selectedText]}>Today</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.dropdownItem} 
                          onPress={() => selectDay('yesterday')}
                        >
                          <Text style={[styles.dropdownText, selectedDay === 'yesterday' && styles.selectedText]}>Yesterday</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.priceValue}>₹ {spendingData[selectedDay].amount}</Text>
                <View style={styles.priceFooter}>
                  <Text style={styles.dollarPrice}>₹ {spendingData[selectedDay].comparison.amount}</Text>
                  <View style={[styles.percentageBox, spendingData[selectedDay].comparison.trend === 'down' && styles.percentageBoxDown]}>
                    <Text style={[styles.percentageText, spendingData[selectedDay].comparison.trend === 'down' && styles.percentageTextDown]}>
                      {spendingData[selectedDay].comparison.percentage}% {spendingData[selectedDay].comparison.trend}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => navigation.navigate("TotalSpents")}
                  >
                    <MaterialIcons name="north-east" size={wp(18)} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.sendButton} onPress={transferMoney}>
                <LinearGradient
                  colors={['#fff', '#f8f8f8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendGradient}
                >
                  <MaterialIcons name="north-east" size={wp(18)} color="#000" />
                  <Text style={styles.sendText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.requestButton} onPress={requestMoney}>
                <MaterialIcons name="south-west" size={wp(18)} color="#fff" />
                <Text style={styles.requestText}>Request</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.qrButton} 
                onPress={() => navigation.navigate("SnowHome")}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: qrIconPulse }
                    ]
                  }}
                >
                  <MaterialIcons name="ac-unit" size={wp(22)} color="white" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <CheckBalanceSheet
          isVisible={isCheckBalanceVisible}
          onClose={handleCloseCheckBalance}
          bankLogo="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSquouX3qJzp6uZwleCOtTBppHfDKlN6vDHg&s"
          accountNumber="12345678"
          accountType="Savings"
          balance="55,500.08"
        />

      </SafeAreaView>
    </GridBackground>
  );
};

// Responsive styles that adapt to different screen sizes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(15),
    height: hp(80),
    paddingTop: Platform.OS === 'ios' ? 0 : hp(10),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  profileButton: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  iconButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: hp(6),
    right: wp(8),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#007AFF',
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(18),
    justifyContent: 'flex-end',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: hp(48),
    paddingTop: hp(8),
    position: 'relative',
  },
  cameraContainer: {
    width: Math.min(wp(260), hp(260)), // Ensure it's not too big on wide screens
    height: Math.min(wp(260), hp(260)),
    borderRadius: wp(20),
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "#000000",
    alignSelf: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(20),
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  divider: {
    width: wp(36),
    height: hp(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: wp(4),
    marginTop: hp(16),
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: hp(16),
    paddingTop: hp(16),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(10),
    marginBottom: hp(24),
  },
  actionButton: {
    flex: 1,
    height: hp(48),
    borderRadius: wp(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    paddingHorizontal: wp(12),
  },
  actionButtonText: {
    color: '#fff',
    fontSize: getFontSize(14),
    fontWeight: '500',
  },
  priceCard: {
    borderRadius: wp(20),
    overflow: 'hidden',
    marginBottom: hp(40),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceCardGradient: {
    padding: wp(16),
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: getFontSize(15),
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  todayText: {
    color: '#fff',
    fontSize: getFontSize(15),
  },
  priceValue: {
    fontSize: getFontSize(34),
    fontWeight: '600',
    color: '#fff',
    marginTop: hp(8),
  },
  priceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(8),
    gap: wp(12),
  },
  dollarPrice: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: getFontSize(15),
  },
  percentageBox: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: wp(12),
  },
  percentageText: {
    color: '#4CAF50',
    fontSize: getFontSize(12),
  },
  shareButton: {
    marginLeft: 'auto',
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: wp(10),
    marginBottom: hp(24),
  },
  sendButton: {
    flex: 1,
    height: hp(50),
    borderRadius: wp(24),
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
  },
  sendText: {
    color: '#000',
    fontSize: getFontSize(16),
    fontWeight: '600',
  },
  requestButton: {
    flex: 1,
    height: hp(50),
    borderRadius: wp(24),
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
  },
  requestText: {
    color: '#fff',
    fontSize: getFontSize(16),
  },
  qrButton: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: wp(8),
    padding: wp(8),
    marginTop: hp(8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
    width: wp(110),
  },
  dropdownItem: {
    paddingVertical: hp(8),
    paddingHorizontal: wp(12),
    borderRadius: wp(4),
    marginVertical: hp(2),
  },
  dropdownText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: getFontSize(14),
    textAlign: 'left',
    width: '100%',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  percentageBoxDown: {
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  percentageTextDown: {
    color: '#F44336',
  },
  tapToScanText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: getFontSize(12),
    marginTop: hp(8),
    textAlign: 'center',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  upiContainer: {
    width: wp(160),
    height: hp(28),
    marginBottom: hp(64),
    borderRadius: wp(14),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'absolute',
    top: hp(-35),
    zIndex: 10,
    left: '50%',
    marginLeft: -wp(80),
  },
  upiGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(8),
    justifyContent: 'center',
  },
  upiText: {
    flex: 0,
    color: '#fff',
    fontSize: getFontSize(10),
    fontWeight: '500',
    marginRight: wp(2),
    paddingLeft: wp(4),
  },
});

export default Home;