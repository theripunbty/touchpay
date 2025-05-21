import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Linking,
  Vibration,
  AppState,
  useWindowDimensions,
  type AppStateStatus
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { request, PERMISSIONS, RESULTS, checkMultiple } from 'react-native-permissions';
import type { Permission } from 'react-native-permissions';
import { PermissionScreenNavigationProp } from '../../../../types/navigation';

interface PermissionStatus {
  phone: boolean;
  sms: boolean;
  camera: boolean;
  location: boolean;
  contacts: boolean;
}

interface PermissionTypes {
  sms: Permission | null;
  phone: Permission;
  location: Permission;
  camera: Permission;
  contacts: Permission;
}

const PermissionScreen = () => {
  const navigation = useNavigation<PermissionScreenNavigationProp>();
  const [permissionState, setPermissionState] = useState<PermissionStatus>({
    phone: false,
    sms: false,
    camera: false,
    location: false,
    contacts: false
  });
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get screen dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive scaling factors based on device size
  const isTablet = width > 768;
  const isLargePhone = width >= 414 && width < 768;
  const isSmallPhone = width < 375;
  
  const baseScale = Math.min(width / 375, height / 812);
  const fontScale = Math.max(0.85, Math.min(baseScale * (isTablet ? 1.2 : 1), 1.5));
  
  // Define permissions categories
  const mandatoryPermissions: (keyof PermissionStatus)[] = ['phone', 'sms', 'camera'];
  const optionalPermissions: (keyof PermissionStatus)[] = ['location', 'contacts'];

  // Permissions based on platform
  const permissionsToRequest: PermissionTypes = Platform.select({
    ios: {
      // iOS doesn't have SMS permission API
      sms: null,
      phone: PERMISSIONS.IOS.CONTACTS,
      location: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      camera: PERMISSIONS.IOS.CAMERA,
      contacts: PERMISSIONS.IOS.CONTACTS
    },
    android: {
      sms: PERMISSIONS.ANDROID.READ_SMS,
      phone: PERMISSIONS.ANDROID.READ_PHONE_STATE,
      location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      camera: PERMISSIONS.ANDROID.CAMERA,
      contacts: PERMISSIONS.ANDROID.READ_CONTACTS
    },
    default: {
      sms: PERMISSIONS.ANDROID.READ_SMS,
      phone: PERMISSIONS.ANDROID.READ_PHONE_STATE,
      location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      camera: PERMISSIONS.ANDROID.CAMERA,
      contacts: PERMISSIONS.ANDROID.READ_CONTACTS
    },
  }) as PermissionTypes;

  // Dynamic styles based on screen dimensions
  const dynamicStyles = {
    container: {
      padding: width * (isTablet ? 0.08 : isSmallPhone ? 0.04 : 0.06),
    },
    skipButton: {
      marginTop: height * (isTablet ? 0.04 : 0.05),
    },
    skipText: {
      fontSize: Math.max(12, 14 * fontScale * (isSmallPhone ? 0.9 : 1)),
    },
    header: {
      fontSize: Math.max(16, 18 * fontScale * (isTablet ? 1.2 : isSmallPhone ? 0.9 : 1)),
      marginTop: height * (isTablet ? 0.04 : 0.06),
      marginBottom: height * (isTablet ? 0.03 : 0.05),
    },
    iconContainer: {
      width: Math.max(35, 40 * baseScale * (isTablet ? 1.2 : 1)),
      height: Math.max(35, 40 * baseScale * (isTablet ? 1.2 : 1)),
      borderRadius: 24 * baseScale,
      marginRight: 16 * baseScale,
    },
    iconSize: {
      width: Math.max(18, 20 * baseScale * (isTablet ? 1.2 : 1)),
      height: Math.max(18, 20 * baseScale * (isTablet ? 1.2 : 1)),
    },
    permissionTitle: {
      fontSize: Math.max(14, 16 * fontScale * (isSmallPhone ? 0.9 : 1)),
      marginRight: 10 * baseScale,
    },
    mandatoryBadge: {
      paddingHorizontal: 6 * baseScale,
      paddingVertical: 2 * baseScale,
      borderRadius: 4 * baseScale,
    },
    mandatoryText: {
      fontSize: Math.max(8, 9 * fontScale),
    },
    permissionDescription: {
      fontSize: Math.max(13, 15 * fontScale * (isSmallPhone ? 0.9 : 1)),
      lineHeight: Math.max(18, 22 * fontScale * (isSmallPhone ? 0.9 : 1)),
    },
    proceedButton: {
      padding: height * (isTablet ? 0.02 : isSmallPhone ? 0.018 : 0.022),
      borderRadius: 50 * baseScale,
      marginTop: height * (isTablet ? 0.03 : 0.04),
      marginBottom: height * (isTablet ? 0.03 : 0.04),
    },
    proceedText: {
      fontSize: Math.max(16, 18 * fontScale * (isSmallPhone ? 0.9 : 1)),
    },
    permissionItem: {
      marginBottom: 35 * baseScale * (isTablet ? 0.9 : isSmallPhone ? 0.8 : 1),
      paddingHorizontal: width * (isTablet ? 0.01 : 0.02),
    }
  };

  // Monitor app state changes to recheck permissions when returning from settings
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // When app becomes active again (e.g., returning from settings)
        checkPermissionsAndProceed();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Initial permission check on component mount
  useEffect(() => {
    checkPermissions();
    
    // Scroll to top with a slight delay for better UX
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 500);
  }, []);

  // Check permissions and proceed to next screen if all mandatory permissions are granted
  const checkPermissionsAndProceed = async () => {
    await checkPermissions();
    
    // Check if all mandatory permissions are granted
    const allMandatoryGranted = mandatoryPermissions.every(
      perm => permissionState[perm]
    );
    
    if (allMandatoryGranted) {
      // If all mandatory permissions are granted, proceed to next screen
      navigation.navigate('SignUp');
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissionsToCheck = [
        permissionsToRequest.phone,
        permissionsToRequest.location,
        permissionsToRequest.camera,
        permissionsToRequest.contacts
      ];
      
      if (permissionsToRequest.sms) {
        permissionsToCheck.push(permissionsToRequest.sms);
      }
      
      const statuses = await checkMultiple(permissionsToCheck);
      
      setPermissionState({
        sms: permissionsToRequest.sms ? statuses[permissionsToRequest.sms] === RESULTS.GRANTED : false,
        phone: statuses[permissionsToRequest.phone] === RESULTS.GRANTED,
        location: statuses[permissionsToRequest.location] === RESULTS.GRANTED,
        camera: statuses[permissionsToRequest.camera] === RESULTS.GRANTED,
        contacts: statuses[permissionsToRequest.contacts] === RESULTS.GRANTED
      });
    } else if (Platform.OS === 'ios') {
      const statuses = await checkMultiple([
        permissionsToRequest.location,
        permissionsToRequest.camera,
        permissionsToRequest.contacts
      ]);
      
      setPermissionState(prev => ({
        ...prev,
        location: statuses[permissionsToRequest.location] === RESULTS.GRANTED,
        camera: statuses[permissionsToRequest.camera] === RESULTS.GRANTED,
        contacts: statuses[permissionsToRequest.contacts] === RESULTS.GRANTED,
        // iOS doesn't have SMS permission API, will handle via other methods
        sms: Platform.OS === 'ios' ? true : prev.sms,
        phone: statuses[permissionsToRequest.contacts] === RESULTS.GRANTED
      }));
    }
  };
  
  const requestPermission = async (type: keyof PermissionStatus) => {
    try {
      if (Platform.OS === 'ios' && type === 'sms') {
        // Handle iOS SMS permission differently (usually not available via API)
        setPermissionState(prev => ({ ...prev, sms: true }));
        return true;
      }

      const permission = permissionsToRequest[type];
      if (!permission) {
        // Handle case where permission is not available
        if (type === 'sms' && Platform.OS === 'ios') {
          // Auto-grant SMS permission on iOS since we can't request it
          setPermissionState(prev => ({ ...prev, sms: true }));
          return true;
        }
        return false;
      }
      
      const result = await request(permission);
      const granted = result === RESULTS.GRANTED;
      
      setPermissionState(prev => ({ ...prev, [type]: granted }));
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Open settings directly without showing an alert
  const openAppSettings = () => {
    Linking.openSettings();
  };

  // Request permissions one by one
  const startPermissionFlow = async () => {
    if (requestingPermissions) return;
    
    setRequestingPermissions(true);
    
    try {
      // First request mandatory permissions one by one
      let allMandatoryGranted = true;
      
      for (const perm of mandatoryPermissions) {
        const granted = await requestPermission(perm);
        if (!granted) {
          allMandatoryGranted = false;
          break;
        }
        // Small delay between permission requests for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (allMandatoryGranted) {
        // If all mandatory permissions are granted, request optional ones
        for (const perm of optionalPermissions) {
          // For optional permissions, we don't care about the result
          await requestPermission(perm);
          // Small delay between permission requests
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // All permissions processed, proceed to next screen
        navigation.navigate('SignUp');
      } else {
        // If any mandatory permission was denied, open settings directly
        openAppSettings();
      }
    } catch (error) {
      console.error("Error in permission flow:", error);
    } finally {
      setRequestingPermissions(false);
    }
  };

  // Handle button click to start permission flow
  const handleProceed = () => {
    if (!requestingPermissions) {
      Vibration.vibrate(50);
      startPermissionFlow();
    }
  };

  // Custom SVG icon components
  const PhoneIcon = () => (
    <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  
  const SmsIcon = () => (
    <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path 
        d="M22 6l-10 7L2 6"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  
  const LocationIcon = () => (
    <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle 
        cx="12" 
        cy="10" 
        r="3"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  
  const CameraIcon = () => (
    <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle 
        cx="12" 
        cy="13" 
        r="4"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  
  const ContactsIcon = () => (
    <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle 
        cx="12" 
        cy="7" 
        r="4"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const isMandatory = (permissionType: string) => {
    return mandatoryPermissions.includes(permissionType as keyof PermissionStatus);
  };

  const PermissionItem = ({ 
    icon, 
    title, 
    description, 
    type
  }: { 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    type: keyof PermissionStatus
  }) => {
    const mandatory = isMandatory(type);
    
    return (
      <View style={[styles.permissionItem, dynamicStyles.permissionItem]}>
        <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
          {icon}
        </View>
        <View style={styles.permissionContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.permissionTitle, dynamicStyles.permissionTitle]}>{title}</Text>
            {mandatory && (
              <View style={[styles.mandatoryBadge, dynamicStyles.mandatoryBadge]}>
                <Text style={[styles.mandatoryText, dynamicStyles.mandatoryText]}>MANDATORY</Text>
              </View>
            )}
          </View>
          <Text style={[styles.permissionDescription, dynamicStyles.permissionDescription]}>{description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />
      
      <View style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity 
          style={[styles.skipButton, dynamicStyles.skipButton]}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.goBack();
          }}
        >
          <Text style={[styles.skipText, dynamicStyles.skipText]}>view more info</Text>
        </TouchableOpacity>

        <Text style={[styles.header, dynamicStyles.header]}>GRANT ACCESS</Text>

        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.permissionsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <PermissionItem
              icon={<PhoneIcon />}
              title="phone state permission"
              description="to verify your SIM and identify your network for secure UPI setup and authentication"
              type="phone"
            />
            <PermissionItem
              icon={<SmsIcon />}
              title="SMS permission"
              description="to automatically read OTPs for safe transaction processing and payment validation"
              type="sms"
            />
            <PermissionItem
              icon={<CameraIcon />}
              title="camera permission"
              description="to scan QR codes for quick and secure payments via UPI and point-of-sale systems"
              type="camera"
            />
            <PermissionItem
              icon={<LocationIcon />}
              title="location permission"
              description="to support nearby payments, detect fraudulent activity, and provide location-aware financial features"
              type="location"
            />
            <PermissionItem
              icon={<ContactsIcon />}
              title="contacts permission"
              description="to streamline money transfers by recognizing contacts with UPI-linked bank accounts"
              type="contacts"
            />
          </ScrollView>
          
          <TouchableOpacity 
            style={[
              styles.proceedButton, 
              dynamicStyles.proceedButton,
              requestingPermissions && styles.disabledButton
            ]}
            onPress={handleProceed}
            disabled={requestingPermissions}
            activeOpacity={0.8}
          >
            <Text style={[styles.proceedText, dynamicStyles.proceedText]}>
              {requestingPermissions ? 'Processing...' : 'Proceed →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080808",
  },
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  skipButton: {
    alignSelf: "flex-end",
  },
  skipText: {
    color: "#fff",
    textDecorationLine: "underline",
  },
  header: {
    color: "#fff",
    letterSpacing: 2,
    fontWeight: "500",
  },
  permissionsContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  permissionItem: {
    flexDirection: "row",
  },
  iconContainer: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  permissionTitle: {
    color: "#fff",
    textTransform: "lowercase",
  },
  mandatoryBadge: {
    backgroundColor: "#444",
  },
  mandatoryText: {
    color: "#fff",
    letterSpacing: 1,
  },
  permissionDescription: {
    color: "#666",
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  proceedText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default PermissionScreen;
