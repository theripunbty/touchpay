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

const SelectAccounts = () => {
  const navigation = useNavigation<SelectAccountsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
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

  // Render popular bank item
  const renderPopularBank = ({ item }: { item: typeof popularBanks[0] }) => (
    <TouchableOpacity
      style={styles.popularBankItem}
      onPress={() => handleBankSelection(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.popularBankLogo}>
        <Image 
          source={{ uri: item.logo }} 
          style={styles.popularBankLogoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.popularBankName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render all bank item
  const renderAllBank = ({ item }: { item: typeof allBanks[0] }) => (
    <TouchableOpacity
      style={styles.allBankItem}
      onPress={() => handleBankSelection(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.allBankLogo}>
        <Image 
          source={{ uri: item.logo }} 
          style={styles.allBankLogoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.allBankName}>{item.name}</Text>
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
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
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Text style={styles.title}>Select bank account</Text>
        <Text style={styles.subtitle}>To setup touchpay UPI</Text>
      </Animated.View>

      {/* Fixed Search Input */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
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
            style={styles.searchInput}
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
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }]
                  }
                ]}
              >
                <Text style={styles.sectionTitle}>Popular banks</Text>
                <FlatList
                  data={item.data}
                  renderItem={renderPopularBank}
                  keyExtractor={item => `popular-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularBanksContainer}
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
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.6) }]
                  }
                ]}
              >
                <Text style={styles.sectionTitle}>All banks</Text>
                {item.data.map((bank) => (
                  <View key={`all-${bank.id}`}>
                    {renderAllBank({ item: bank })}
                  </View>
                ))}
              </Animated.View>
            );
          }
        }}
        keyExtractor={(item) => `section-${item.type}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allBanksContainer}
        ListFooterComponent={() => (
          <View style={styles.footerSpacer} />
        )}
      />

      {/* Fixed UPI Powered Logo at Bottom */}
      {!isKeyboardVisible && (
        <View style={styles.upiFooter}>
          <Text style={styles.poweredByText}>powered by</Text>
          <UPIIcon  width={40} height={15}/>

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
    paddingHorizontal: 24,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginTop: height * 0.02,
    marginBottom: 10,
  },
  title: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontSize: 16,
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    padding: 0,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  popularBanksContainer: {
    paddingRight: 0,
    paddingBottom: 10,
  },
  popularBankItem: {
    alignItems: 'center',
    marginRight: 10,
    width: 70,
  },
  popularBankLogo: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 8,
  },
  popularBankLogoImage: {
    width: 35,
    height: 35,
  },
  popularBankName: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  allBanksContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  allBankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  allBankLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 15,
  },
  allBankLogoImage: {
    width: 30,
    height: 30,
  },
  allBankName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  upiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  poweredByText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 10,
    marginRight: 5,
  },
  footerSpacer: {
    height: 20,
  },
});

export default SelectAccounts;