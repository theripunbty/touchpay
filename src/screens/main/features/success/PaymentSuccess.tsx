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
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Handle the copy UPI reference ID
  const handleCopyUpiRef = () => {
    console.log('Copying UPI Ref ID');
  };

  // Navigate back to home
  const handleDone = () => {
    navigation.navigate('Home');
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeValue }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
            <MaterialIcons name="check" size={48} color="#fff" />
          </Animated.View>
        </View>

        {/* Payment Info */}
        <Animated.View style={[styles.paymentInfo, { opacity: fadeValue }]}>
          <Text style={styles.paidText}>₹{amount}</Text>
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
          <LinearGradient
            colors={['#8A2BE2', '#9932CC', '#9400D3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rewardBanner}
          >
            <View style={styles.rewardContent}>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playButtonText}>Play now</Text>
              </TouchableOpacity>
              <View style={styles.rewardInfoRow}>
                <MaterialCommunityIcons name="star-shooting" size={16} color="#fff" />
                <Text style={styles.rewardText}>UPI REWARD • EXPIRES IN 7 DAYS</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* UPI Reference Section */}
        <Animated.View style={[styles.detailsContainer, { transform: [{ translateY: slideUpValue }], opacity: fadeValue }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>UPI Ref ID</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{upiRefId}</Text>
              <TouchableOpacity onPress={handleCopyUpiRef} style={styles.copyButton}>
                <MaterialIcons name="content-copy" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sent to</Text>
            <Text style={styles.detailValue}>{upiId}</Text>
          </View>
        </Animated.View>

        {/* Done Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeValue }]}>
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={handleDone}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8A2BE2', '#9932CC']}
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
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
    backgroundColor: '#329932',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  paidText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
    fontFamily: 'System',
  },
  recipientText: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 8,
    fontFamily: 'System',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontFamily: 'System',
  },
  rewardBannerContainer: {
    marginBottom: 32,
    marginLeft: 20,
    marginRight: 20,
  },
  rewardBanner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardContent: {
    padding: 20,
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  rewardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'System',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontFamily: 'System',
    fontWeight: '500',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginHorizontal: -16,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  doneButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default PaymentSuccess;