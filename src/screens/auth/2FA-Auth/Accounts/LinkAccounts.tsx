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
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { LinkAccountsScreenNavigationProp } from '../../../../types/navigation';
import axios from 'axios';
import { api, authService } from '../../../../utils/apiService';

const { width, height } = Dimensions.get('window');

// Define responsive scaling factors
const isTablet = width > 768;
const isSmallPhone = width < 375;
const scale = Math.min(width / 375, height / 812);
const fontScale = Math.max(0.85, Math.min(scale * (isTablet ? 1.1 : 1), 1.3));

// Define types for the API request and response
interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  displayNumber: string;
  accountType: string;
  logo: string;
  accRefNumber: string;
  ifsc: string;
  vpa?: string;
  mmid?: string;
}

interface FetchAccountsRequest {
  FetchCustomerAccountsRequest: {
    SubHeader: {
      requestUUID: string;
      serviceRequestId: string;
      serviceRequestVersion: string;
      channelId: string;
    };
    FetchCustomerAccountsRequestBody: {
      customerId: string;
      mobileNumber: string;
      otp?: string;
      device: {
        deviceId: string;
      };
    };
  };
}

interface FetchAccountsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    FetchCustomerAccountsResponse: {
      SubHeader: {
        requestUUID: string;
        serviceRequestId: string;
        serviceRequestVersion: string;
        channelId: string;
      };
      FetchCustomerAccountsResponseBody: {
        code: string;
        result: string;
        data: Array<{
          name: string;
          mmid: string;
          uidnum: string;
          iin?: string;
          Iin?: string;
          aeba: string;
          mbeba: string;
          accRefNumber: string;
          type: string;
          vpa: string;
          vpas?: Array<any>;
          status: string;
          maskedAccnumber: string;
          ifsc: string;
          partyId: string | null;
          dLength?: string;
          dType?: string;
          atmpinFormat?: string;
          atmpinlength?: string;
          otpFormat?: string;
          otpLength?: string;
        }>;
      };
    };
  };
}

// Maximum number of retry attempts for API calls
const MAX_RETRY_ATTEMPTS = 3;

// Function to generate a random UUID compatible with React Native
const generateUUID = (): string => {
  try {
    // Implementation of RFC4122 version 4 compliant UUID
    const s: string[] = [];
    const hexDigits = '0123456789abcdef';
    
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // Bits 12-15 of time_hi_and_version field to 0010
    s[14] = '4';
    // Bits 6-7 of clock_seq_hi_and_reserved to 01
    s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);
    // Insert hyphens
    s[8] = s[13] = s[18] = s[23] = '-';
    
    const uuid = s.join('');
    console.log('Generated UUID:', uuid);
    return uuid;
  } catch (error) {
    // If any error occurs in the UUID generation, use fallback
    console.error('Error in UUID generation:', error);
    return generateFallbackId();
  }
};

// Generate a timestamp + random based ID as fallback (works in any JS environment)
const generateFallbackId = (): string => {
  const timestamp = new Date().getTime().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  
  // Format to look similar to a UUID
  const segments = [
    timestamp.substring(0, 8), 
    randomPart1.substring(0, 4),
    '4' + randomPart1.substring(0, 3), // Version 4 mock
    '8' + randomPart2.substring(0, 3), // RFC4122 variant mock
    randomPart2.substring(0, 12)
  ];
  
  const fallbackId = segments.join('-');
  console.log('Generated fallback ID:', fallbackId);
  return fallbackId;
};

// Responsive styles calculation
const getResponsiveStyles = () => {
  return {
    header: {
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.01,
      marginBottom: height * 0.02,
    },
    backButton: {
      width: Math.max(32, 40 * scale),
      height: Math.max(32, 40 * scale),
      borderRadius: Math.max(16, 20 * scale),
    },
    stepIndicator: {
      fontSize: Math.max(11, 12 * fontScale),
    },
    title: {
      fontSize: Math.min(32, Math.max(24, 28 * fontScale)),
      marginBottom: height * 0.01,
    },
    subtitle: {
      fontSize: Math.max(13, 14 * fontScale),
      lineHeight: Math.max(19, 20 * fontScale),
    },
    formContainer: {
      paddingHorizontal: width * 0.06,
    },
    titleContainer: {
      marginTop: height * (isTablet ? 0.05 : isSmallPhone ? 0.02 : 0.03),
      marginBottom: height * (isTablet ? 0.04 : 0.03),
    },
    bankListContainer: {
      marginTop: height * 0.02,
    },
    bankItem: {
      padding: width * 0.04,
      marginBottom: height * 0.015,
      borderRadius: Math.max(10, 12 * scale),
    },
    bankLogo: {
      width: Math.max(40, 44 * scale),
      height: Math.max(40, 44 * scale),
      borderRadius: Math.max(20, 22 * scale),
      marginRight: width * 0.04,
    },
    bankName: {
      fontSize: Math.max(14, 16 * fontScale),
    },
    accountNumber: {
      fontSize: Math.max(12, 14 * fontScale),
    },
    accountType: {
      fontSize: Math.max(11, 13 * fontScale),
    },
    linkButton: {
      height: Math.max(50, Math.min(56 * scale, 60)),
      borderRadius: Math.max(25, Math.min(28 * scale, 30)),
    },
    buttonText: {
      fontSize: Math.max(14, 16 * fontScale),
    },
    emptyStateTitle: {
      fontSize: Math.max(16, 18 * fontScale), 
    },
    emptyStateDescription: {
      fontSize: Math.max(12, 14 * fontScale),
      lineHeight: Math.max(18, 20 * fontScale),
    },
    infoTitle: {
      fontSize: Math.max(13, 15 * fontScale),
    },
    infoDescription: {
      fontSize: Math.max(11, 13 * fontScale),
      lineHeight: Math.max(16, 18 * fontScale),
    }
  };
};

const LinkAccounts = () => {
  const navigation = useNavigation<LinkAccountsScreenNavigationProp>();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  // Get responsive styles
  const responsiveStyles = getResponsiveStyles();

  // Loading component
  const LoadingState = () => (
    <Animated.View 
      style={[
        styles.loadingContainer,
        { opacity: loadingAnim }
      ]}
    >
      <ActivityIndicator size="large" color="#00A3FF" />
      <Text style={styles.loadingText}>Fetching your linked bank accounts</Text>
    </Animated.View>
  );

  // Error component
  const ErrorState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateCard}>
        <View style={styles.emptyStateIconContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
            <Circle cx="30" cy="30" r="30" fill="rgba(255, 100, 100, 0.08)" />
            <Circle cx="30" cy="30" r="20" fill="rgba(255, 100, 100, 0.15)" />
            <Path 
              d="M30 20V30M30 38V38.1M42 30C42 36.6274 36.6274 42 30 42C23.3726 42 18 36.6274 18 30C18 23.3726 23.3726 18 30 18C36.6274 18 42 23.3726 42 30Z" 
              stroke="rgba(255, 100, 100, 0.8)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.emptyStateTitle}>Connection Error</Text>
        <Text style={styles.emptyStateDescription}>
          {error || 'We encountered an error while fetching your bank accounts. Please try again.'}
        </Text>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  // Function to fetch accounts from API with retry capability
  const fetchBankAccounts = async (retryCount = 0) => {
    try {
      console.log('fetchBankAccounts called, retry count:', retryCount);
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      // Generate a unique request UUID using our custom function
      const requestUUID = generateUUID();

      // Build the request payload
      const payload: FetchAccountsRequest = {
        FetchCustomerAccountsRequest: {
          SubHeader: {
            requestUUID: requestUUID,
            serviceRequestId: "FETCH_ACC_001",
            serviceRequestVersion: "1.0",
            channelId: "MOBILE"
          },
          FetchCustomerAccountsRequestBody: {
            customerId: "CUST123456", // This should come from user context/login
            mobileNumber: "9876543210", // This should come from user context/login
            otp: "123456", // In a real app, this would be collected from user input
            device: {
              deviceId: "DEVICE123456789" // This should be dynamically generated from the device
            }
          }
        }
      };

      // Add X-Request-ID header
      const headers = {
        'X-Request-ID': requestUUID
      };

      // Make the API call with testing header - Using the api instance from apiService
      console.log('Making API call');
      const response = await api.post<FetchAccountsResponse>(
        '/axis/upi/accounts/fetch',
        payload,
        { headers }
      );

      // Process the response
      if (response.data.success) {
        const fetchedAccounts = response.data.data?.FetchCustomerAccountsResponse?.FetchCustomerAccountsResponseBody?.data || [];
        const responseCode = response.data.data?.FetchCustomerAccountsResponse?.FetchCustomerAccountsResponseBody?.code;
        const responseResult = response.data.data?.FetchCustomerAccountsResponse?.FetchCustomerAccountsResponseBody?.result;
        
        console.log('Response code:', responseCode, 'Result:', responseResult);

        if (responseCode === "XH" && responseResult === "ACCOUNT DOES NOT EXIST") {
          // No accounts exist for this user
          console.log('No accounts exist for this user');
          setAccounts([]);
          setError(null); // No error, just empty accounts
        }
        else if (responseCode === "00" && responseResult === "success" && fetchedAccounts && fetchedAccounts.length > 0) {
          // Success with accounts
          // Transform the API response into our app's account format
          const formattedAccounts: BankAccount[] = fetchedAccounts.map((account, index) => {
            // Get bank name from IFSC code (first 4 characters)
            const bankCode = account.ifsc.substring(0, 4);
            let bankName = 'AXIS'; // Default to AXIS since we're using Axis Bank API
            
            // Map bank codes to bank names for different Indian banks
            if (bankCode === 'AXIS') bankName = 'AXIS';
            else if (bankCode === 'SBIN') bankName = 'SBI';
            else if (bankCode === 'HDFC') bankName = 'HDFC';
            else if (bankCode === 'ICIC') bankName = 'ICICI';
            else if (bankCode === 'PUNB') bankName = 'Punjab National Bank';
            else if (bankCode === 'BARB') bankName = 'Bank of Baroda';
            else if (bankCode === 'UBIN') bankName = 'Union Bank';
            
            return {
              id: (index + 1).toString(),
              bankName: bankName,
              accountNumber: account.accRefNumber,
              displayNumber: account.maskedAccnumber,
              accountType: account.type.charAt(0).toUpperCase() + account.type.slice(1).toLowerCase(), // Convert SAVINGS to Savings
              logo: getBankLogo(bankName), // Get appropriate bank logo
              accRefNumber: account.accRefNumber,
              ifsc: account.ifsc,
              vpa: account.vpa,
              mmid: account.mmid
            };
          });

          setAccounts(formattedAccounts);

          // If only one account, automatically select it
          if (formattedAccounts.length === 1) {
            setSelectedAccount(formattedAccounts[0].id);
          }
        } else if (responseCode === "00" && responseResult === "success" && (!fetchedAccounts || fetchedAccounts.length === 0)) {
          // Success but no accounts found
          console.log('Success response but no accounts found');
          setAccounts([]);
          setError(null); // No error, just empty accounts
        } else {
          // Handle known error codes
          let errorMessage;
          switch (responseCode) {
            case "01":
              errorMessage = "Invalid request parameters";
              break;
            case "02":
              errorMessage = "User authentication failed";
              break;
            case "03":
              errorMessage = "Service temporarily unavailable";
              break;
            default:
              errorMessage = `Error fetching accounts: ${responseResult}`;
          }
          throw new Error(errorMessage);
        }
      } else {
        // Handle API error
        throw new Error(response.data.message || 'Failed to fetch accounts');
      }
    } catch (err: any) {
      console.error('Error fetching bank accounts:', err);
      
      // Handle network errors and implement retry logic
      if (axios.isAxiosError(err) && (err.code === 'ECONNABORTED' || !err.response) && retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`Retry attempt ${retryCount + 1} for fetchBankAccounts`);
        return fetchBankAccounts(retryCount + 1);
      }
      
      // Handle authentication errors by letting the apiService handle token refresh
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // The api instance from apiService will automatically handle token refresh
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          console.log('Authentication failed, retrying request');
          return fetchBankAccounts(retryCount + 1);
        }
      }
      
      // Set appropriate error message based on error type
      let errorMessage = 'Unable to fetch your bank accounts. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your details.';
            break;
          case 401:
          case 403:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Bank services are currently unavailable. Please try again later.';
            break;
        }
      }
      
      setError(errorMessage);
      setAccounts([]);
    } finally {
      setIsLoading(false);
      
      // Start the main animations after loading
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
    }
  };

  // Handle account selection
  const handleAccountSelection = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  // Handle continue button press - Link the selected account
  const handleContinue = () => {
    if (selectedAccount) {
      const account = accounts.find(acc => acc.id === selectedAccount);
      
      if (account) {
        // Navigate to verification screen
        navigation.navigate('VerifyLinking', {
          bankName: account.bankName,
          accountId: account.id,
          maskedAccountNumber: account.displayNumber,
          ifsc: account.ifsc,
          accRefNumber: account.accRefNumber
        });
        
        // Track account linking initiated event
        trackEvent('upi_account_linking', 'verification_initiated', {
          bank_name: account.bankName,
          account_type: account.accountType,
        });
      }
    }
  };
  
  // Save account details for UPI integration
  const saveAccountForUPI = async (account: BankAccount) => {
    try {
      // Track account linking start event
      trackEvent('upi_account_linking', 'started', {
        bank_name: account.bankName,
        account_type: account.accountType,
      });

      // Per RBI and NPCI regulations, we only store the minimum required details
      // for UPI integration and payments
      const upiAccountDetails = {
        accountId: account.id,
        bankName: account.bankName,
        maskedAccountNumber: account.displayNumber,
        accountType: account.accountType,
        accRefNumber: account.accRefNumber, // Account reference number for UPI transactions
        ifsc: account.ifsc, // Required for fund transfers
        vpa: account.vpa, // Virtual Payment Address if available
        mmid: account.mmid // Mobile Money Identifier if available
      };
      
      // In a real app, you would make an API call to your backend to store this information
      // Example:
      // await api.post('/user/accounts/upi/link', upiAccountDetails);
      
      console.log('Account details saved for UPI integration:', upiAccountDetails);
      
      // You might also store a flag in local storage indicating that the user has linked an account
      // This is useful for navigating the user correctly when they open the app next time
      // Example with Async Storage (you would need to import it):
      // await AsyncStorage.setItem('HAS_LINKED_UPI_ACCOUNT', 'true');
      
      // Track account linking success event
      trackEvent('upi_account_linking', 'success', {
        bank_name: account.bankName,
        account_type: account.accountType,
      });
      
    } catch (error) {
      console.error('Error saving account for UPI:', error);
      Alert.alert('Error', 'Failed to save your account details. Please try again.');
      
      // Track account linking failure event
      trackEvent('upi_account_linking', 'failed', {
        reason: 'api_error',
      });
    }
  };

  // Retry fetching accounts
  const handleRetry = () => {
    fetchBankAccounts();
  };

  // Helper function to get bank logo based on bank name
  const getBankLogo = (bankName: string): string => {
    // Return Axis Bank logo URL for Axis Bank accounts
    if (bankName.toUpperCase() === 'AXIS') {
      return 'https://shoponarista.com/images/app/140422070121pm-010621025008pm-circle-cropped(53).png';
    }
    
    // These are just emoji representations for other banks
    // In a real app, you would use actual bank logos as images
    switch(bankName.toUpperCase()) {
      case 'SBI':
        return '🏦';
      case 'HDFC':
        return '🏛️';
      case 'ICICI':
        return '💰';
      case 'PUNJAB NATIONAL BANK':
        return '💸';
      case 'BANK OF BARODA':
        return '💹';
      case 'UNION BANK':
        return '💵';
      case 'KOTAK':
        return '💱';
      case 'IDFC':
        return '💴';
      case 'YES BANK':
        return '💲';
      default:
        return '🏦';
    }
  };

  // Analytics tracking functions (these would be implemented in a real analytics service)
  const trackScreenView = (screenName: string, params: Record<string, any> = {}) => {
    // This would call your analytics service to track screen views
    // For example: Firebase, Google Analytics, etc.
    console.log(`Screen view: ${screenName}`, params);
  };

  const trackScreenExit = (screenName: string) => {
    console.log(`Screen exit: ${screenName}`);
  };

  const trackEvent = (eventCategory: string, eventAction: string, eventParams: Record<string, any> = {}) => {
    // This would call your analytics service to track events
    // Ensure compliance with privacy regulations by not including PII
    console.log(`Event: ${eventCategory} - ${eventAction}`, eventParams);
    
    // For regulated financial apps, also log important events for compliance
    if (['upi_account_linking', 'payment_initiated', 'transaction_completed'].includes(eventCategory)) {
      logComplianceEvent(eventCategory, eventAction, eventParams);
    }
  };

  const logComplianceEvent = (category: string, action: string, params: Record<string, any>) => {
    // Log events for regulatory compliance (audit trails)
    // This would typically be a secure logging mechanism
    // that complies with RBI and NPCI requirements
    const timestamp = new Date().toISOString();
    const eventData = {
      timestamp,
      category,
      action,
      ...params,
      // Include a session ID or user reference, but no PII
    };
    
    console.log('Compliance log:', eventData);
    // In a real app, this would be sent to a secure logging service
    // Example: await api.post('/compliance/log', eventData);
  };

  // Start animations and fetch accounts when component mounts
  useEffect(() => {
    // Log that we're starting to fetch accounts
    console.log('Starting to fetch bank accounts');
    
    // Show loading animation first
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Track screen view (for analytics)
    trackScreenView('LinkAccountsScreen');

    // Fetch accounts from API
    fetchBankAccounts();

    return () => {
      // Cleanup when component unmounts
      trackScreenExit('LinkAccountsScreen');
    };
  }, []);

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
      <View style={[styles.header, responsiveStyles.header]}>
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
        <View style={styles.stepIndicatorContainer}>
          <Text style={[styles.stepIndicator, responsiveStyles.stepIndicator]}>Step 3 of 3</Text>
          <View style={styles.stepProgressContainer}>
            <View style={styles.stepProgressActive} />
            <View style={styles.stepProgressActive} />
            <View style={styles.stepProgressActive} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.formContainer, responsiveStyles.formContainer]}
      >
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : (
          <>
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
              <Text style={[styles.title, responsiveStyles.title]}>Your Bank Accounts</Text>
              <Text style={[styles.subtitle, responsiveStyles.subtitle]}>Select the account you want to link with UPI</Text>
            </Animated.View>

            {/* Bank Account List */}
            <Animated.View 
              style={[
                styles.bankListContainer,
                responsiveStyles.bankListContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: Animated.multiply(slideAnim, 1.3) }]
                }
              ]}
            >
              {accounts.length > 0 ? (
                <FlatList
                  data={accounts}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.bankListContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.bankItem,
                        responsiveStyles.bankItem,
                        selectedAccount === item.id && styles.selectedBankItem
                      ]}
                      onPress={() => handleAccountSelection(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.bankLogo, responsiveStyles.bankLogo]}>
                        {item.logo.startsWith('http') ? (
                          <Image 
                            source={{ uri: item.logo }} 
                            style={styles.bankLogoImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.bankLogoText}>{item.logo}</Text>
                        )}
                      </View>
                      <View style={styles.bankDetails}>
                        <View style={styles.bankNameContainer}>
                          <Text style={[styles.bankName, responsiveStyles.bankName]}>{item.bankName}</Text>
                          <Text style={[styles.accountNumber, responsiveStyles.accountNumber]}>{item.displayNumber}</Text>
                        </View>
                        <Text style={[styles.accountType, responsiveStyles.accountType]}>{item.accountType}</Text>
                      </View>
                      <View style={[
                        styles.radioButton,
                        selectedAccount === item.id && styles.radioButtonSelected
                      ]}>
                        {selectedAccount === item.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyStateIconContainer}>
                      <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
                        <Circle cx="30" cy="30" r="30" fill="rgba(0, 163, 255, 0.08)" />
                        <Circle cx="30" cy="30" r="20" fill="rgba(0, 163, 255, 0.15)" />
                        <Path 
                          d="M40 27H20C18.8954 27 18 27.8954 18 29V38C18 39.1046 18.8954 40 20 40H40C41.1046 40 42 39.1046 42 38V29C42 27.8954 41.1046 27 40 27Z" 
                          stroke="rgba(0, 163, 255, 0.8)" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <Path 
                          d="M35 40V24C35 22.9391 34.5786 21.9217 33.8284 21.1716C33.0783 20.4214 32.0609 20 31 20H29C27.9391 20 26.9217 20.4214 26.1716 21.1716C25.4214 21.9217 25 22.9391 25 24V40" 
                          stroke="rgba(0, 163, 255, 0.8)" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <Path 
                          d="M30 33.5C30.8284 33.5 31.5 32.8284 31.5 32C31.5 31.1716 30.8284 30.5 30 30.5C29.1716 30.5 28.5 31.1716 28.5 32C28.5 32.8284 29.1716 33.5 30 33.5Z" 
                          fill="rgba(0, 163, 255, 0.8)"
                        />
                      </Svg>
                    </View>
                    <Text style={[styles.emptyStateTitle, responsiveStyles.emptyStateTitle]}>No Bank Accounts Found</Text>
                    <Text style={[styles.emptyStateDescription, responsiveStyles.emptyStateDescription]}>
                      We couldn't find any bank accounts linked to your mobile number. You need to have an existing bank account that supports UPI.
                    </Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Path 
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                          <Path 
                            d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                          <Path 
                            d="M12 17H12.01" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTitle, responsiveStyles.infoTitle]}>Why link a bank account?</Text>
                        <Text style={[styles.infoDescription, responsiveStyles.infoDescription]}>
                          Linking your bank account allows you to send and receive money instantly
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Path 
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                          <Path 
                            d="M8 14L16 14" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                          <Path 
                            d="M12 10L12 18" 
                            stroke="rgba(255, 255, 255, 0.7)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTitle, responsiveStyles.infoTitle]}>Need to add a bank account?</Text>
                        <Text style={[styles.infoDescription, responsiveStyles.infoDescription]}>
                          Please visit your bank branch or use your bank's mobile app to create an account and enable it for UPI
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </>
        )}
      </KeyboardAvoidingView>

      {/* Link Account Button */}
      {!isLoading && !error && (
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              paddingHorizontal: width * 0.06,
              paddingBottom: isTablet ? height * 0.05 : height * 0.04,
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
              styles.linkButton, 
              responsiveStyles.linkButton,
              selectedAccount ? styles.activeButton : styles.inactiveButton
            ]}
            onPress={handleContinue}
            disabled={!selectedAccount}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText, 
              responsiveStyles.buttonText,
              selectedAccount ? styles.activeButtonText : styles.inactiveButtonText
            ]}>
              Link Account
            </Text>
            <View style={[
              styles.arrowContainer,
              selectedAccount ? styles.activeArrowContainer : styles.inactiveArrowContainer
            ]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M5 12H19M19 12L12 5M19 12L12 19" 
                  stroke={selectedAccount ? "#000000" : "rgba(255,255,255,0.5)"} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          <Text style={styles.secureText}>
            <Svg width="12" height="12" viewBox="0 -1 24 24" fill="none">
              <Path 
                d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" 
                stroke="rgba(255, 255, 255, 0.5)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <Path 
                d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" 
                stroke="rgba(255, 255, 255, 0.5)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{marginLeft: 4}}>  Secure bank connection</Text>
          </Text>
        </Animated.View>
      )}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
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
    marginTop: height * 0.02,
    marginBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
  },
  bankListContainer: {
    flex: 1,
  },
  bankListContent: {
    paddingBottom: 20,
    marginTop: 40,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedBankItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bankLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  bankLogoImage: {
    width: '100%',
    height: '100%',
  },
  bankLogoText: {
    fontSize: 20,
  },
  bankDetails: {
    flex: 1,
  },
  bankNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  accountNumber: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
  },
  accountType: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '400',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  noAccountsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noAccountsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addAccountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyStateCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconContainer: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 163, 255, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyStateButtonIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 163, 255, 0.06)',
    borderRadius: 20,
  },
  securityBadgeText: {
    color: 'rgba(0, 163, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  linkButton: {
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
  secureText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  testModeButton: {
    display: 'none',
  },
  testModeText: {
    display: 'none',
  },
});

export default LinkAccounts;
