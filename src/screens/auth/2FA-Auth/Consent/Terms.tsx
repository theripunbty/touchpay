import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { TermsScreenNavigationProp } from '../../../../types/navigation';

const SkeletonLoading = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonParagraph}>
        {[...Array(6)].map((_, index) => (
          <View 
            key={`line-${index}`} 
            style={[
              styles.skeletonLine, 
              { width: `${Math.floor(Math.random() * 30) + 70}%` }
            ]} 
          />
        ))}
      </View>
      <View style={styles.skeletonCheckbox} />
      <View style={styles.skeletonButton} />
    </View>
  );
};

const Terms = () => {
  const navigation = useNavigation<TermsScreenNavigationProp>();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigation.navigate('Permission');
  };

  const toggleAgreement = () => {
    setIsAgreed(!isAgreed);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    setIsAtBottom(isCloseToBottom);
  };

  const handleLinkPress = (url: string) => {
    let title = 'Web Page';
    if (url.includes('rbi-guidelines')) {
      title = 'RBI Guidelines';
    } else if (url.includes('circular')) {
      title = 'NPCI Circular';
    } else if (url.includes('terms')) {
      title = 'Terms and Conditions';
    }
    navigation.navigate('WebPage', { url, title });
  };

  // Helper component for properly aligned links
  const LinkText = ({ text, url }: { text: string; url: string }) => (
    <TouchableOpacity 
      onPress={() => handleLinkPress(url)}
    >
      <Text style={styles.highlight}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.goBack();
          }}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M15 18L9 12L15 6" 
              stroke="#000000" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regulatory Compliance</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoading />
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >        
          <View style={styles.section}>
            <Text style={styles.paragraph}>
              As per the guidelines set by the{' '}
              <LinkText text="Reserve Bank of India (RBI)" url="https://intellaris.co/rbi-guidelines" />
              {' '}and the{' '}
              <LinkText text="National Payments Corporation of India (NPCI)" url="https://www.npci.org.in/what-we-do/upi/circular" />
              , completing UPI registration requires a mandatory one-time authentication process. This is a critical security measure designed to protect users and prevent unauthorized access. During this process, we will securely verify your registered mobile number, linked bank account, and identity through an OTP (One-Time Password)-based verification. This ensures that the UPI setup is initiated only by the rightful account holder and adds an extra layer of security to your digital transactions. Please ensure that your mobile number is linked to your bank account and is active to complete the registration process without interruption. Once verified, you will be able to seamlessly access UPI services for secure and real-time payments.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.agreementContainer}
            onPress={() => {
              Vibration.vibrate(50);
              toggleAgreement();
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isAgreed && styles.checkedBox]}>
              {isAgreed && (
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M20 6L9 17L4 12" 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <LinkText text="Terms and Conditions" url="https://pay.google.com/intl/en_in/about/terms/" />
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              !isAgreed && styles.disabledButton,
              isAgreed && styles.activeButton
            ]}
            onPress={() => {
              if (isAgreed) {
                Vibration.vibrate(50);
                handleNext();
              }
            }}
            disabled={!isAgreed}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, isAgreed && styles.activeButtonText]}>Continue</Text>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path 
                d="M5 12H19M19 12L12 5M19 12L12 19" 
                stroke={isAgreed ? "#121212" : "#666666"} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 16,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: '#333333',
    letterSpacing: 0.2,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    top: 2,
  },
  checkedBox: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  agreementText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    textAlignVertical: 'center',
  },
  nextButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
    opacity: 0.5,
  },
  activeButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    opacity: 1,
  },
  buttonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  activeButtonText: {
    color: '#000000',
  },
  highlight: {
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
    top: 3,
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  skeletonParagraph: {
    marginBottom: 30,
  },
  skeletonLine: {
    height: 15,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
    opacity: 0.8,
  },
  skeletonCheckbox: {
    width: '100%',
    height: 40,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    marginBottom: 24,
    opacity: 0.6,
  },
  skeletonButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
});

export default Terms;