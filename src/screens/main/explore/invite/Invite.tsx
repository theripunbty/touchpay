import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
  Dimensions,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// For a real implementation, you would use:
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { SvgXml } from 'react-native-svg';

type RootStackParamList = {
  Home: undefined;
  Invite: undefined;
};

type InviteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Invite'>;

// SVG strings for social icons
const whatsappIcon = `<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 15.55C16.4 16.11 15.55 16.58 14.92 16.73C14.48 16.83 13.9 16.91 11.41 15.91C8.39 14.71 6.47 11.63 6.32 11.43C6.18 11.23 5.19 9.92 5.19 8.57C5.19 7.22 5.87 6.57 6.12 6.3C6.33 6.08 6.67 5.97 6.99 5.97C7.1 5.97 7.2 5.97 7.29 5.98C7.55 5.99 7.68 6.01 7.84 6.39C8.04 6.87 8.53 8.22 8.6 8.37C8.68 8.52 8.75 8.72 8.64 8.92C8.54 9.13 8.45 9.23 8.3 9.4C8.15 9.57 8.01 9.7 7.86 9.89C7.72 10.05 7.56 10.23 7.74 10.54C7.92 10.84 8.52 11.8 9.4 12.58C10.54 13.58 11.46 13.88 11.81 14.02C12.07 14.12 12.39 14.1 12.57 13.89C12.8 13.62 13.09 13.17 13.38 12.73C13.59 12.42 13.85 12.36 14.13 12.46C14.42 12.55 15.76 13.21 16.08 13.37C16.39 13.53 16.6 13.6 16.68 13.74C16.75 13.88 16.75 14.39 16.54 15.03L16.64 15.55Z"/></svg>`;

const instagramIcon = `<svg viewBox="0 0 24 24"><defs><radialGradient id="instagramGradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#instagramGradient)" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 7.5C16.5 6.67 17.17 6 18 6C18.83 6 19.5 6.67 19.5 7.5C19.5 8.33 18.83 9 18 9C17.17 9 16.5 8.33 16.5 7.5ZM12 7.5C14.48 7.5 16.5 9.52 16.5 12C16.5 14.48 14.48 16.5 12 16.5C9.52 16.5 7.5 14.48 7.5 12C7.5 9.52 9.52 7.5 12 7.5ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"/></svg>`;

const xIcon = `<svg viewBox="0 0 24 24" fill="#000000"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 9.5C16.64 9.69 16.64 9.88 16.64 10.06C16.64 13.11 14.39 16.61 10.11 16.61C8.64 16.61 7.26 16.18 6.08 15.42C6.3 15.45 6.53 15.46 6.76 15.46C7.95 15.46 9.06 15.04 9.94 14.33C8.81 14.31 7.85 13.57 7.53 12.54C7.71 12.58 7.89 12.6 8.08 12.6C8.35 12.6 8.61 12.56 8.86 12.5C7.68 12.26 6.79 11.22 6.79 9.96V9.93C7.13 10.12 7.53 10.24 7.95 10.25C7.26 9.8 6.8 9.02 6.8 8.14C6.8 7.68 6.92 7.25 7.14 6.87C8.4 8.43 10.29 9.46 12.42 9.56C12.38 9.37 12.35 9.18 12.35 8.98C12.35 7.55 13.51 6.39 14.94 6.39C15.69 6.39 16.36 6.71 16.83 7.21C17.41 7.09 17.96 6.88 18.46 6.59C18.27 7.19 17.87 7.68 17.35 8C17.86 7.94 18.34 7.8 18.79 7.6C18.46 8.1 18.04 8.54 17.55 8.9C17.55 8.92 17.55 8.94 17.55 8.96C17.55 9.14 17.55 9.32 17.55 9.5H16.64Z"/></svg>`;

const moreIcon = `<svg viewBox="0 0 24 24" fill="#CCCCCC"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13C14 14.1 13.1 15 12 15ZM12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7ZM12 19C10.9 19 10 18.1 10 17C10 15.9 10.9 15 12 15C13.1 15 14 15.9 14 17C14 18.1 13.1 19 12 19Z"/></svg>`;

// Social icon component with proper icon implementation
const SocialIcon = ({ 
  iconName, 
  size = 50, 
  color = "#FFFFFF", 
  backgroundColor = "#25D366" 
}: { 
  iconName: string; 
  size?: number; 
  color?: string;
  backgroundColor?: string;
}) => (
  <View style={[
    styles.socialIconContainer, 
    { width: size, height: size, backgroundColor }
  ]}>
    <MCIcon name={iconName} size={size * 0.6} color={color} />
  </View>
);

const Invite: React.FC = () => {
  const navigation = useNavigation<InviteNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [referralCode] = useState('RIPUN16670');
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Referral code copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Referral code copied to clipboard!');
    }
  };

  const shareViaApp = (app: string) => {
    const message = `Use my referral code ${referralCode} to sign up for touchpay and get up to ₹350 when you complete your first UPI transaction!`;
    
    let url = '';
    switch (app) {
      case 'whatsapp':
        url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL scheme
        // This is just a fallback to open Instagram
        url = 'instagram://';
        break;
      case 'twitter':
        url = `twitter://post?message=${encodeURIComponent(message)}`;
        break;
      default:
        // Use the native share dialog for "more" option
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          // In a real app, you would use the Share API:
          // Share.share({ message });
          Alert.alert('Share', 'Would share via native dialog in a real app');
        }
        return;
    }

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', `${app} is not installed on your device`);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.title}>Invite & earn upto ₹350</Text>
        
        <Text style={styles.description}>
          Invite friends and get upto ₹350 when they complete their first UPI transaction through touchpay
        </Text>

        <TouchableOpacity 
          style={styles.referralCodeContainer}
          onPress={copyToClipboard}
          activeOpacity={0.7}
        >
          <Text style={styles.referralCode}>{referralCode}</Text>
          <View style={styles.copyIcon}>
            <Icon name="content-copy" size={20} color="#999999" />
          </View>
        </TouchableOpacity>

        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => shareViaApp('whatsapp')}
            activeOpacity={0.8}
          >
            <SocialIcon 
              iconName="whatsapp" 
              backgroundColor="#25D366" 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => shareViaApp('instagram')}
            activeOpacity={0.8}
          >
            <SocialIcon 
              iconName="instagram" 
              backgroundColor="#C13584" 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => shareViaApp('twitter')}
            activeOpacity={0.8}
          >
            <SocialIcon 
              iconName="twitter" 
              backgroundColor="#1DA1F2" 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => shareViaApp('more')}
            activeOpacity={0.8}
          >
            <SocialIcon 
              iconName="share-variant" 
              backgroundColor="#000000" 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#666666',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 40,
  },
  referralCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  copyIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIconText: {
    fontSize: 18,
    color: '#999999',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconContainer: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default Invite;