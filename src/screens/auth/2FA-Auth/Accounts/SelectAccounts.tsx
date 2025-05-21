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
  Keyboard,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { SelectAccountsScreenNavigationProp } from '../../../../types/navigation';
import UPIIcon from "@assets/banks/upi.svg";

const { width, height } = Dimensions.get('window');

// Define responsive scaling factors
const isTablet = width > 768;
const isSmallPhone = width < 375;
const scale = Math.min(width / 375, height / 812);
const fontScale = Math.max(0.85, Math.min(scale * (isTablet ? 1.1 : 1), 1.3));

// Bank data - Popular banks with their logos
const popularBanks = [
  { id: '1', name: 'SBI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1024px-SBI-logo.svg.png' },
  { id: '2', name: 'HDFC', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSquouX3qJzp6uZwleCOtTBppHfDKlN6vDHg&s' },
  { id: '3', name: 'Kotak', logo: 'https://companieslogo.com/img/orig/KOTAKBANK.NS-36440c5e.png?t=1720244492' },
  { id: '4', name: 'ICICI', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1I9yl3hTBLo4L4kcjqAnkEg-2aVeXIH_hBg&s' },
  { id: '5', name: 'SCB', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxq_2HuMCg8jPpRVy0wgGjMhkw3PsciOEwvw&s' },
];

// All banks data
const allBanks = [
  { id: '6', name: 'ABHYUDAYA CO-OP. BANK LTD', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI2qZWDCfhjZEIDWHhrh6xLjJiTEp7gYFiaw&s' },
  { id: '7', name: 'Adarsh Co-operative Bank Limited', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxvCUwzvkklV00LYmyZXJybA8pOWiq1DzZ7w&s' },
  { id: '8', name: 'Ahmednagar Merchant\'s Co Operative Bank Ltd', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXdVdtUnoEDcgBA3L6fPvCDB_jlh4YmQhqJw&s' },
  { id: '9', name: 'Airtel Payments Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYrFblcmgcaQnniPn0GsT6hTHWDkscpQZlqA&s' },
  // Add more banks as needed
];

// Responsive styles calculation
const getResponsiveStyles = () => {
  return {
    header: {
      paddingHorizontal: width * 0.06,
      paddingTop: height * 0.02,
      marginBottom: height * 0.015,
    },
    backButton: {
      width: Math.max(32, 40 * scale),
      height: Math.max(32, 40 * scale),
      borderRadius: Math.max(16, 20 * scale),
    },
    titleContainer: {
      paddingHorizontal: width * 0.06,
      marginTop: height * (isTablet ? 0.03 : isSmallPhone ? 0.015 : 0.02),
      marginBottom: height * 0.03,
    },
    title: {
      fontSize: Math.min(32, Math.max(24, 28 * fontScale)),
      marginBottom: height * 0.01,
    },
    subtitle: {
      fontSize: Math.max(13, 16 * fontScale),
    },
    searchContainer: {
      paddingHorizontal: width * 0.06,
      marginBottom: height * 0.03,
    },
    searchInputContainer: {
      height: Math.max(44, 50 * scale),
      borderRadius: Math.max(10, 12 * scale),
      paddingHorizontal: width * 0.04,
    },
    searchInput: {
      fontSize: Math.max(14, 16 * fontScale),
    },
    sectionContainer: {
      paddingHorizontal: width * 0.06,
      marginBottom: height * 0.035,
    },
    sectionTitle: {
      fontSize: Math.max(15, 18 * fontScale),
      marginBottom: height * 0.02,
      paddingLeft: width * 0.01,
    },
    popularBanksContainer: {
      paddingVertical: height * 0.01,
      paddingHorizontal: width * 0.01,
    },
    popularBankItem: {
      width: Math.min(width * 0.2, 80),
      marginRight: width * 0.04,
    },
    popularBankLogo: {
      width: Math.min(width * 0.13, 54),
      height: Math.min(width * 0.13, 54),
      borderRadius: Math.min(width * 0.065, 27),
      marginBottom: height * 0.012,
    },
    popularBankName: {
      fontSize: Math.max(10, 12 * fontScale),
    },
    allBankItem: {
      paddingVertical: height * 0.018,
      paddingHorizontal: width * 0.01,
    },
    allBankLogo: {
      width: Math.max(40, 50 * scale),
      height: Math.max(40, 50 * scale),
      borderRadius: Math.max(20, 25 * scale),
      marginRight: width * 0.04,
    },
    allBankName: {
      fontSize: Math.max(13, 14 * fontScale),
    },
    allBanksContent: {
      paddingTop: height * 0.01,
    },
    upiFooter: {
      paddingVertical: height * 0.015,
    },
    poweredByText: {
      fontSize: Math.max(9, 10 * fontScale),
      marginRight: width * 0.02,
    },
    footerSpacer: {
      height: height * 0.03,
    }
  };
};

const SelectAccounts = () => {
  const navigation = useNavigation<SelectAccountsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Get responsive styles
  const responsiveStyles = getResponsiveStyles();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle bank selection
  const handleBankSelection = (bankId: string) => {
    // Navigate to the next screen or perform action
    navigation.navigate('LinkAccounts');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <Svg height={height} width={width} style={styles.backgroundSvg}>
          <Defs>
            <LinearGradient id="gradCircle1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0045EB" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#00A3FF" stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="gradCircle2" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#07C8F9" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#0052D4" stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#00A3FF" stopOpacity="0" />
              <Stop offset="50%" stopColor="#00A3FF" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#00A3FF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* Enhanced decorative elements */}
          <Circle cx={width * 0.85} cy={height * 0.15} r="120" fill="url(#gradCircle1)" />
          <Circle cx={width * 0.1} cy={height * 0.85} r="150" fill="url(#gradCircle2)" />
          
          {/* Horizontal accent line */}
          <Rect x="0" y={height * 0.3} width={width} height="1.5" fill="url(#gradLine)" />
          
          {/* Enhanced grid pattern */}
          <G opacity="0.1">
            {Array.from({ length: 12 }).map((_, i) => (
              <Path
                key={`horizontal-${i}`}
                d={`M0,${height * (i / 15 + 0.1)} L${width},${height * (i / 15 + 0.1)}`}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <Path
                key={`vertical-${i}`}
                d={`M${width * (i / 7)},0 L${width * (i / 7)},${height}`}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            ))}
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
              stroke="#000000" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Fixed Title and Description */}
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
        <Text style={[styles.title, responsiveStyles.title]}>Select bank account</Text>
        <Text style={[styles.subtitle, responsiveStyles.subtitle]}>To setup touchpay UPI</Text>
      </Animated.View>

      {/* Fixed Search Input */}
      <Animated.View 
        style={[
          styles.searchContainer,
          responsiveStyles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }]
          }
        ]}
      >
        <View style={[styles.searchInputContainer, responsiveStyles.searchInputContainer]}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <Path 
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
              stroke="rgba(0, 0, 0, 0.5)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
          <TextInput
            style={[styles.searchInput, responsiveStyles.searchInput]}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>
      </Animated.View>

      {/* Main Content */}
      <FlatList
        data={[
          { type: 'popular', data: popularBanks },
          { type: 'all', data: allBanks }
        ]}
        renderItem={({ item }) => {
          if (item.type === 'popular') {
            return (
              <Animated.View 
                key="popular-banks-section"
                style={[
                  styles.sectionContainer,
                  responsiveStyles.sectionContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }]
                  }
                ]}
              >
                <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>Popular banks</Text>
                <FlatList
                  data={item.data}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.popularBankItem, responsiveStyles.popularBankItem]}
                      onPress={() => handleBankSelection(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.popularBankLogo, responsiveStyles.popularBankLogo]}>
                        <Image 
                          source={{ uri: item.logo }} 
                          style={styles.popularBankLogoImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.popularBankName, responsiveStyles.popularBankName]}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => `popular-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.popularBanksContainer, responsiveStyles.popularBanksContainer]}
                  scrollEnabled={true}
                />
              </Animated.View>
            );
          } else {
            return (
              <Animated.View 
                key="all-banks-section"
                style={[
                  styles.sectionContainer,
                  responsiveStyles.sectionContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.6) }]
                  }
                ]}
              >
                <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>All banks</Text>
                <View style={responsiveStyles.allBanksContent}>
                  {item.data.map((bank) => (
                    <TouchableOpacity
                      key={`all-${bank.id}`}
                      style={[styles.allBankItem, responsiveStyles.allBankItem]}
                      onPress={() => handleBankSelection(bank.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.allBankLogo, responsiveStyles.allBankLogo]}>
                        <Image 
                          source={{ uri: bank.logo }} 
                          style={styles.allBankLogoImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.allBankName, responsiveStyles.allBankName]}>{bank.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            );
          }
        }}
        keyExtractor={(item) => `section-${item.type}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allBanksContainer}
        ListFooterComponent={() => (
          <View style={[styles.footerSpacer, responsiveStyles.footerSpacer]} />
        )}
      />

      {/* Fixed UPI Powered Logo at Bottom */}
      {!isKeyboardVisible && (
        <View style={[styles.upiFooter, responsiveStyles.upiFooter]}>
          <Text style={[styles.poweredByText, responsiveStyles.poweredByText]}>powered by</Text>
          <UPIIcon width={isTablet ? 50 : 40} height={isTablet ? 18 : 15}/>
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
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
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleContainer: {
    marginTop: height * 0.02,
  },
  title: {
    color: '#000000',
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '400',
  },
  searchContainer: {
    marginTop: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    padding: 0,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#000000',
    fontWeight: '600',
  },
  popularBanksContainer: {
    paddingRight: 0,
  },
  popularBankItem: {
    alignItems: 'center',
  },
  popularBankLogo: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  popularBankLogoImage: {
    width: '70%',
    height: '70%',
  },
  popularBankName: {
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  allBanksContainer: {
    paddingBottom: 20,
  },
  allBankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  allBankLogo: {
    backgroundColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  allBankLogoImage: {
    width: '60%',
    height: '60%',
  },
  allBankName: {
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  upiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  poweredByText: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  footerSpacer: {
    height: 20,
  },
});

export default SelectAccounts;