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
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { TermsScreenNavigationProp } from '../../../../types/navigation';

const SkeletonLoading = () => {
  const { width } = useWindowDimensions();
  
  // Calculate responsive scaling factors
  const baseWidth = 375; // Standard iPhone width
  const scale = width / baseWidth;
  const fontScale = Math.max(0.8, Math.min(scale, 1.3)); // Limit scaling between 0.8 and 1.3
  
  return (
    <View style={[styles.skeletonContainer, { paddingHorizontal: 20 * scale }]}>
      <View style={[styles.skeletonParagraph, { marginTop: 40 * scale }]}>
        {[...Array(6)].map((_, index) => (
          <View 
            key={`line-${index}`} 
            style={[
              styles.skeletonLine, 
              { 
                width: `${Math.floor(Math.random() * 30) + 70}%`,
                height: 15 * fontScale,
                marginBottom: 10 * scale
              }
            ]} 
          />
        ))}
      </View>
      <View style={[styles.skeletonCheckbox, { height: 40 * scale, marginBottom: 24 * scale }]} />
      <View style={[styles.skeletonButton, { height: 50 * scale }]} />
    </View>
  );
};

const Terms = () => {
  const navigation = useNavigation<TermsScreenNavigationProp>();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive scaling factors
  const baseWidth = 375; // Standard iPhone width
  const baseHeight = 812; // Standard iPhone height
  const scale = Math.min(width / baseWidth, height / baseHeight);
  const fontScale = Math.max(0.8, Math.min(scale, 1.3)); // Limit scaling between 0.8 and 1.3

  // Dynamic styles based on screen dimensions
  const dynamicStyles = {
    headerPadding: {
      padding: 12 * scale,
    },
    headerTitle: {
      fontSize: 16 * fontScale,
    },
    contentPadding: {
      paddingHorizontal: 20 * scale,
      paddingBottom: 30 * scale,
    },
    section: {
      marginTop: 40 * scale,
      marginBottom: 16 * scale,
    },
    paragraphText: {
      fontSize: 14 * fontScale,
      lineHeight: 21 * fontScale,
    },
    agreementContainer: {
      marginBottom: 24 * scale,
      marginTop: 20 * scale,
      paddingVertical: 10 * scale,
    },
    checkbox: {
      width: 20 * scale,
      height: 20 * scale,
      borderRadius: 4 * scale,
      marginRight: 10 * scale,
    },
    agreementText: {
      fontSize: 14 * fontScale,
    },
    button: {
      paddingVertical: 14 * scale,
      paddingHorizontal: 20 * scale,
      borderRadius: 8 * scale,
      marginBottom: 16 * scale,
    },
    buttonText: {
      fontSize: 15 * fontScale,
      marginRight: 8 * scale,
    },
    iconSize: {
      width: 20 * scale,
      height: 20 * scale,
    },
    checkmarkSize: {
      width: 12 * scale,
      height: 12 * scale,
    },
    arrowSize: {
      width: 16 * scale,
      height: 16 * scale,
    },
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.headerPadding]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.goBack();
          }}
        >
          <Svg width={dynamicStyles.iconSize.width} height={dynamicStyles.iconSize.height} viewBox="0 0 24 24" fill="none">
            <Path 
              d="M15 18L9 12L15 6" 
              stroke="#000000" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Regulatory Compliance</Text>
        <View style={{ width: dynamicStyles.iconSize.width }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoading />
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, dynamicStyles.contentPadding]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >        
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.paragraph, dynamicStyles.paragraphText]}>
              As per the guidelines set by the <Text style={styles.highlight} onPress={() => handleLinkPress("https://intellaris.co/rbi-guidelines")}>Reserve Bank of India (RBI)</Text> and the <Text style={styles.highlight} onPress={() => handleLinkPress("https://www.npci.org.in/what-we-do/upi/circular")}>National Payments Corporation of India (NPCI)</Text>, completing UPI registration requires a mandatory one-time authentication process. This is a critical security measure designed to protect users and prevent unauthorized access. During this process, we will securely verify your registered mobile number, linked bank account, and identity through an OTP (One-Time Password)-based verification. This ensures that the UPI setup is initiated only by the rightful account holder and adds an extra layer of security to your digital transactions. Please ensure that your mobile number is linked to your bank account and is active to complete the registration process without interruption. Once verified, you will be able to seamlessly access UPI services for secure and real-time payments.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.agreementContainer, dynamicStyles.agreementContainer]}
            onPress={() => {
              Vibration.vibrate(50);
              toggleAgreement();
            }}
            activeOpacity={0.8}
          >
            <View style={[
              styles.checkbox, 
              dynamicStyles.checkbox,
              isAgreed && styles.checkedBox
            ]}>
              {isAgreed && (
                <Svg width={dynamicStyles.checkmarkSize.width} height={dynamicStyles.checkmarkSize.height} viewBox="0 0 24 24" fill="none">
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
            <Text style={[styles.agreementText, dynamicStyles.agreementText]}>
              I agree to the <Text style={styles.highlight} onPress={() => handleLinkPress("https://pay.google.com/intl/en_in/about/terms/")}>Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              dynamicStyles.button,
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
            <Text style={[
              styles.buttonText, 
              dynamicStyles.buttonText,
              isAgreed && styles.activeButtonText
            ]}>Continue</Text>
            <Svg width={dynamicStyles.arrowSize.width} height={dynamicStyles.arrowSize.height} viewBox="0 0 24 24" fill="none">
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
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    // Dynamic padding will be applied via dynamicStyles
  },
  section: {
    // Dynamic margins will be applied via dynamicStyles
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  paragraph: {
    color: '#333333',
    letterSpacing: 0.2,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  agreementText: {
    color: '#333333',
    flex: 1,
    textAlignVertical: 'center',
  },
  nextButton: {
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#000000',
  },
  highlight: {
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
  },
  skeletonParagraph: {
    marginBottom: 30,
  },
  skeletonLine: {
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    opacity: 0.8,
  },
  skeletonCheckbox: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  skeletonButton: {
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
});

export default Terms;