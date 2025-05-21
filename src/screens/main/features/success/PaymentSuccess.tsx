import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface PaymentSuccessProps {
  navigation: any;
  route: {
    params: {
      amount: string;
      recipientName: string;
      upiId?: string;
      upiRefId?: string;
    };
  };
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ navigation, route }) => {
  const { amount, recipientName, upiId = 'paytmqr5clxx7@ptys', upiRefId = '513659509665' } = route.params || {};
  
  // Animation values
  const scaleValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);
  const slideUpValue = new Animated.Value(30);
  const pulseValue = new Animated.Value(1);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    
    return `${date} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  // Handle the share functionality
  const handleShare = () => {
    console.log('Sharing payment details');
  };

  // Navigate back to home
  const handleDone = () => {
    navigation.navigate('Home');
  };

  // Show transaction details
  const handleShowDetails = () => {
    console.log('Showing transaction details');
  };

  // Start animations on component mount
  useEffect(() => {
    // Success icon animation
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Fade in animation for content
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Slide up animation for details
    Animated.timing(slideUpValue, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulsing animation for reward banner
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff']}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeValue }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerButton}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleShare} 
              style={styles.headerButton}
            >
              <MaterialIcons name="share" size={22} color="#666" />
            </TouchableOpacity>
          </Animated.View>

          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Animated.View style={[
              styles.successIcon, 
              { 
                transform: [{ scale: scaleValue }],
                shadowOpacity: scaleValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              }
            ]}>
              <LinearGradient
                colors={['#8A2BE2', '#9932CC']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="check" size={42} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Payment Info */}
          <Animated.View style={[styles.paymentInfo, { opacity: fadeValue }]}>
            <View style={styles.amountContainer}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <Text style={styles.paidText}>{amount}</Text>
            </View>
            <Text style={styles.recipientText}>Paid to {recipientName}</Text>
            <Text style={styles.dateTimeText}>{getCurrentDateTime()}</Text>
          </Animated.View>

          {/* Reward Banner */}
          <Animated.View style={[
            styles.rewardBannerContainer, 
            { 
              transform: [
                { translateY: slideUpValue },
                { scale: pulseValue }
              ], 
              opacity: fadeValue 
            }
          ]}>
            <ImageBackground
              source={require('@assets/games/space-hunt-horizantal.png')}
              style={styles.rewardBanner}
              imageStyle={styles.rewardBannerImage}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.rewardBanner}
              >
                <View style={styles.rewardContent}>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonText}>Play now</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#fff" style={styles.playButtonIcon} />
                  </TouchableOpacity>
                  <View style={styles.rewardTextContainer}>
                    <Text style={styles.rewardSubtitle}>PLAY TO CLAIM CASHBACK</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>

          {/* Details Button */}
          <TouchableOpacity 
            onPress={handleShowDetails}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>More Details</Text>
          </TouchableOpacity>

          {/* Done Button */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeValue }]}>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleDone}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#8A2BE2', '#8A2BE2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  rupeeSymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'System',
    marginBottom: 6,
    marginRight: 2,
  },
  paidText: {
    fontSize: 52,
    fontWeight: '800',
    color: '#2D3748',
    fontFamily: 'System',
    letterSpacing: -1,
    lineHeight: 52,
  },
  recipientText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
    fontWeight: '500',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontFamily: 'System',
    fontWeight: '500',
    marginBottom: 24,
  },
  rewardBannerContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    width: width * 0.85,
    alignSelf: 'center',
  },
  rewardBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: 200,
  },
  rewardBannerImage: {
    borderRadius: 16,
    opacity: 1,
    resizeMode: 'cover',
  },
  rewardContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  rewardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rewardBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rewardTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  rewardTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  rewardSubtitle: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  playButtonIcon: {
    marginLeft: 8,
  },
  detailsButton: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  detailsButtonText: {
    fontSize: 16,
    color: '#8A2BE2',
    fontFamily: 'System',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  doneButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
});

export default PaymentSuccess;