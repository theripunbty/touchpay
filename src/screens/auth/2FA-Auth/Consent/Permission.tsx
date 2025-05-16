import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  Linking,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { request, PERMISSIONS, RESULTS, checkMultiple } from 'react-native-permissions';
import type { Permission } from 'react-native-permissions';
import { PermissionScreenNavigationProp } from '../../../../types/navigation';

interface PermissionTypes {
  sms: Permission | null;
  phone: Permission;
  location: Permission;
}

const PermissionScreen = () => {
  const navigation = useNavigation<PermissionScreenNavigationProp>();
  const [permissionState, setPermissionState] = useState({
    sms: false,
    phone: false,
    location: false,
  });
  const [denialCount, setDenialCount] = useState({
    sms: 0,
    phone: 0,
    location: 0,
  });

  // Permissions based on platform
  const permissionsToRequest: PermissionTypes = Platform.select({
    ios: {
      // iOS doesn't have SMS permission API
      sms: null,
      phone: PERMISSIONS.IOS.CONTACTS,
      location: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    },
    android: {
      sms: PERMISSIONS.ANDROID.READ_SMS,
      phone: PERMISSIONS.ANDROID.READ_PHONE_STATE,
      location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    },
    default: {
      sms: PERMISSIONS.ANDROID.READ_SMS,
      phone: PERMISSIONS.ANDROID.READ_PHONE_STATE,
      location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    },
  }) as PermissionTypes;

  // Check permissions when component mounts
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissionsToCheck = [
        permissionsToRequest.phone,
        permissionsToRequest.location,
      ];
      
      if (permissionsToRequest.sms) {
        permissionsToCheck.push(permissionsToRequest.sms);
      }
      
      const statuses = await checkMultiple(permissionsToCheck);
      
      setPermissionState({
        sms: permissionsToRequest.sms ? statuses[permissionsToRequest.sms] === RESULTS.GRANTED : false,
        phone: statuses[permissionsToRequest.phone] === RESULTS.GRANTED,
        location: statuses[permissionsToRequest.location] === RESULTS.GRANTED,
      });
    } else if (Platform.OS === 'ios') {
      // iOS handles permissions differently
      const locationStatus = await checkMultiple([permissionsToRequest.location]);
      
      setPermissionState(prev => ({
        ...prev,
        location: locationStatus[permissionsToRequest.location] === RESULTS.GRANTED,
        // iOS doesn't have SMS permission API, will handle via other methods
        // Phone permission also handled differently
      }));
    }
  };

  const requestPermission = async (type: 'sms' | 'phone' | 'location') => {
    try {
      if (Platform.OS === 'ios' && type === 'sms') {
        // Handle iOS SMS permission differently (usually not available via API)
        setPermissionState(prev => ({ ...prev, sms: true }));
        return;
      }

      if (Platform.OS === 'ios' && type === 'phone') {
        // Handle iOS phone permission differently
        const result = await request(PERMISSIONS.IOS.CONTACTS);
        setPermissionState(prev => ({ ...prev, phone: result === RESULTS.GRANTED }));
        if (result !== RESULTS.GRANTED) {
          handlePermissionDenial(type);
        }
        return;
      }

      const permission = permissionsToRequest[type];
      if (!permission) {
        // Handle case where permission is not available
        if (type === 'sms' && Platform.OS === 'ios') {
          // Auto-grant SMS permission on iOS since we can't request it
          setPermissionState(prev => ({ ...prev, sms: true }));
        }
        return;
      }
      
      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        setPermissionState(prev => ({ ...prev, [type]: true }));
      } else {
        handlePermissionDenial(type);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      handlePermissionDenial(type);
    }
  };

  const handlePermissionDenial = (type: 'sms' | 'phone' | 'location') => {
    setDenialCount(prev => {
      const newCount = prev[type] + 1;
      
      // If denied multiple times, direct to settings
      if (newCount >= 2) {
        Alert.alert(
          'Permission Required',
          `${type.charAt(0).toUpperCase() + type.slice(1)} permission is required for the app to function properly.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
      
      return { ...prev, [type]: newCount };
    });
  };

  const handleContinue = () => {
    // Check if all permissions are granted
    const allPermissionsGranted = Object.values(permissionState).every(status => status);
    
    if (allPermissionsGranted) {
      navigation.navigate('SignUp');
    } else {
      Alert.alert(
        'Permissions Required',
        'All permissions are required to continue. Please grant all permissions.',
        [{ text: 'OK' }]
      );
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.goBack();
          }}
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
        <Text style={styles.headerTitle}>Required Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >        
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Please grant the following permissions to continue:
          </Text>
        </View>

        {/* SMS Permission */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <View style={styles.iconContainer}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            </View>
            <Text style={styles.permissionTitle}>SMS</Text>
            {permissionState.sms ? (
              <View style={styles.grantedBadge}>
                <Text style={styles.grantedText}>Granted</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={() => {
                  Vibration.vibrate(50);
                  requestPermission('sms');
                }}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.permissionDescription}>
            We sync SMS to verify your device and set up UPI as per RBI and NPCI guidelines.
          </Text>
        </View>

        {/* Phone Permission */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <View style={styles.iconContainer}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.permissionTitle}>Phone</Text>
            {permissionState.phone ? (
              <View style={styles.grantedBadge}>
                <Text style={styles.grantedText}>Granted</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={() => {
                  Vibration.vibrate(50);
                  requestPermission('phone');
                }}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.permissionDescription}>
            We collect phone number to match SIM on the device to your registered phone number.
          </Text>
        </View>

        {/* Location Permission */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <View style={styles.iconContainer}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            </View>
            <Text style={styles.permissionTitle}>Location</Text>
            {permissionState.location ? (
              <View style={styles.grantedBadge}>
                <Text style={styles.grantedText}>Granted</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={() => {
                  Vibration.vibrate(50);
                  requestPermission('location');
                }}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.permissionDescription}>
            We use your location to prevent fraud and secure your account from unauthorized access from unfamiliar locations.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            !Object.values(permissionState).every(Boolean) && styles.disabledButton,
            Object.values(permissionState).every(Boolean) && styles.activeButton
          ]}
          onPress={() => {
            if (Object.values(permissionState).every(Boolean)) {
              Vibration.vibrate(50);
              handleContinue();
            }
          }}
          disabled={!Object.values(permissionState).every(Boolean)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.buttonText, 
            Object.values(permissionState).every(Boolean) && styles.activeButtonText
          ]}>
            Continue
          </Text>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M5 12H19M19 12L12 5M19 12L12 19" 
              stroke={Object.values(permissionState).every(Boolean) ? "#121212" : "white"} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  permissionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  allowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  grantedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  grantedText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    opacity: 0.6,
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  activeButtonText: {
    color: '#121212',
  },
});

export default PermissionScreen;
