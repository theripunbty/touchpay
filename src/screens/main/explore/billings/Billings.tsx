import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// Custom icon wrapper component to maintain consistent styling
const IconWrapper = ({ 
  IconComponent, 
  name, 
  color, 
  size 
}: { 
  IconComponent: any; 
  name: string; 
  color: string; 
  size: number 
}) => (
  <View style={[styles.icon, { backgroundColor: color + '32' }]}>
    <IconComponent name={name} color={color} size={size} />
  </View>
);

const BackIcon = () => (
  <MaterialIcons name="arrow-back" size={24} color="#222222" />
);

type RootStackParamList = {
  Home: undefined;
  Billings: undefined;
  ServiceDetails: { service: string };
};

type BillingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Billings'>;

// Snowflake component with improved continuous animation
const Snowflake = ({ size, left, delay, duration, startY = -50, type = 'normal' }: { 
  size: number, 
  left: number, 
  delay: number, 
  duration: number, 
  startY?: number,
  type?: 'normal' | 'light' | 'accent'
}) => {
  const snowAnim = useRef(new Animated.Value(startY)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Create continuous loop animation function
  const startAnimation = () => {
    // Reset the position first
    snowAnim.setValue(startY);
    
    // Start animation sequence
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(snowAnim, {
          toValue: Dimensions.get('window').height, // Fall across entire screen height
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration - 700),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 700, // Longer fade-out for smoother transition
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Restart animation to create endless loop
      startAnimation();
    });
  };

  useEffect(() => {
    // Start the side-to-side sway animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: -15,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(swayAnim, {
          toValue: 15,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    
    // Start the falling animation
    startAnimation();
    
    // Clean up animations on unmount
    return () => {
      snowAnim.stopAnimation();
      swayAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, []);

  // Different colors based on type
  const getColor = () => {
    switch(type) {
      case 'light':
        return "rgba(200, 220, 255, 0.3)";
      case 'accent':
        return "rgba(160, 190, 255, 0.35)";
      default:
        return "rgba(180, 200, 255, 0.32)";
    }
  };

  // Use different icons based on random variation
  const renderSnowflakeIcon = () => {
    const iconType = Math.random() > 0.65 ? 'alt' : 'default';
    
    if (iconType === 'alt') {
      return <MaterialIcons name="ac-unit" size={size} color={getColor()} />;
    }
    
    return <MaterialCommunityIcons name="snowflake" size={size} color={getColor()} />;
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: left,
        opacity: opacityAnim,
        transform: [
          { translateY: snowAnim },
          { translateX: swayAnim },
          { rotate: `${Math.random() * 360}deg` }
        ],
        zIndex: 1000,
      }}
    >
      {renderSnowflakeIcon()}
    </Animated.View>
  );
};

const Billings: React.FC = () => {
  const navigation = useNavigation<BillingsScreenNavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animation values
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;
  const bannerScale = useRef(new Animated.Value(0.8)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // For game-like banner
  const [hasStarted, setHasStarted] = useState(false);

  // Section animation values
  const sectionAnimations = [
    {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(50)).current,
    },
    {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(50)).current,
    },
    {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(50)).current,
    },
    {
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(50)).current,
    }
  ];
  
  // Scale effect on scroll
  const scrollScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  });

  // Run animations on component mount
  useEffect(() => {
    setHasStarted(true);
    
    // Header animation
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
    
    Animated.timing(headerSlide, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();

    // Staggered section animations
    sectionAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(600 + index * 200),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.poly(4)),
          }),
        ]),
      ]).start();
    });
  }, []);

  // Generate snowflakes with staggered starting positions for entire screen
  const renderSnowflakes = () => {
    if (!hasStarted) return null;
    
    const flakes = [];
    const totalFlakes = 20; // Reduced from 32 to 20
    const screenWidth = Dimensions.get('window').width;
    
    for (let i = 0; i < totalFlakes; i++) {
      const size = 4 + Math.random() * 10; // Reduced from 8-24 to 4-14
      const left = Math.random() * screenWidth;
      
      // More variety in delays and durations
      const delay = Math.random() * 4000;
      const duration = 6000 + Math.random() * 8000; // Slightly slower
      
      // More variety in starting positions
      const startY = Math.random() * -400;
      
      // Add variety with different snowflake types
      const snowflakeTypes = ['normal', 'light', 'accent'] as const;
      const type = snowflakeTypes[Math.floor(Math.random() * snowflakeTypes.length)];
      
      flakes.push(
        <Snowflake 
          key={i} 
          size={size} 
          left={left} 
          delay={delay} 
          duration={duration}
          startY={startY}
          type={type}
        />
      );
    }
    return flakes;
  };

  const renderServiceItem = (
    name: string,
    iconData: { component: any; name: string },
    color: string,
    index: number,
    sectionIndex: number,
  ) => {
    // Individual item animation
    const itemFade = useRef(new Animated.Value(0)).current;
    const itemScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(800 + sectionIndex * 200 + index * 50),
        Animated.parallel([
          Animated.timing(itemFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(itemScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(2)),
          }),
        ]),
      ]).start();
    }, [itemFade, itemScale, index, sectionIndex]);

    return (
      <Animated.View
        style={[
          styles.serviceItem,
          {
            opacity: itemFade,
            transform: [{ scale: itemScale }],
          },
        ]}
        key={name}
      >
        <TouchableOpacity
          style={styles.serviceButton}
          onPress={() => navigation.navigate('ServiceDetails', { service: name })}
          activeOpacity={0.7}
        >
          <IconWrapper 
            IconComponent={iconData.component} 
            name={iconData.name} 
            color={color} 
            size={24} 
          />
          <Text style={styles.serviceText}>{name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Global snowflakes overlay */}
      <View style={styles.snowflakesContainer}>
        {renderSnowflakes()}
      </View>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Animated.View style={{ opacity: headerFade }}>
            <BackIcon />
          </Animated.View>
        </TouchableOpacity>
        <Animated.Text 
          style={[
            styles.headerTitle,
            {
              opacity: headerFade,
              transform: [{ translateX: headerSlide }],
            }
          ]}
        >
          Bill payments & recharges
        </Animated.Text>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >


        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: sectionAnimations[0].opacity,
              transform: [{ translateY: sectionAnimations[0].translateY }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Popular</Text>
          <View style={styles.servicesGrid}>
            {renderServiceItem('Mobile recharge', { component: MaterialIcons, name: 'smartphone' }, '#8A2BE2', 0, 0)}
            {renderServiceItem('FASTag', { component: Feather, name: 'navigation' }, '#8A2BE2', 1, 0)}
            {renderServiceItem('Electricity', { component: MaterialCommunityIcons, name: 'lightning-bolt' }, '#8A2BE2', 2, 0)}
            {renderServiceItem('Credit card', { component: Feather, name: 'credit-card' }, '#8A2BE2', 3, 0)}
            {renderServiceItem('Broadband', { component: MaterialIcons, name: 'router' }, '#8A2BE2', 4, 0)}
            {renderServiceItem('Mobile postpaid', { component: MaterialIcons, name: 'stay-current-portrait' }, '#8A2BE2', 5, 0)}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: sectionAnimations[1].opacity,
              transform: [{ translateY: sectionAnimations[1].translateY }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Finances</Text>
          <View style={styles.servicesGrid}>
            {renderServiceItem('Insurance', { component: MaterialCommunityIcons, name: 'shield-check' }, '#0066CC', 0, 1)}
            {renderServiceItem('Loans', { component: MaterialIcons, name: 'account-balance' }, '#0066CC', 1, 1)}
            {renderServiceItem('Recurring deposits', { component: MaterialCommunityIcons, name: 'bank-plus' }, '#0066CC', 2, 1)}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: sectionAnimations[2].opacity,
              transform: [{ translateY: sectionAnimations[2].translateY }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Utilities</Text>
          <View style={styles.servicesGrid}>
            {renderServiceItem('Water', { component: MaterialCommunityIcons, name: 'water' }, '#009966', 0, 2)}
            {renderServiceItem('Piped gas', { component: MaterialCommunityIcons, name: 'gas-cylinder' }, '#009966', 1, 2)}
            {renderServiceItem('Cylinder', { component: Feather, name: 'tool' }, '#009966', 2, 2)}
            {renderServiceItem('Prepaid Meter', { component: Ionicons, name: 'speedometer-outline' }, '#009966', 3, 2)}
            {renderServiceItem('DTH', { component: MaterialIcons, name: 'tv' }, '#009966', 4, 2)}
            {renderServiceItem('Cable TV', { component: MaterialIcons, name: 'settings-input-antenna' }, '#009966', 5, 2)}
            {renderServiceItem('Landline postpaid', { component: MaterialIcons, name: 'phone' }, '#009966', 6, 2)}
            {renderServiceItem('Housing societies', { component: MaterialIcons, name: 'apartment' }, '#009966', 7, 2)}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: sectionAnimations[3].opacity,
              transform: [{ translateY: sectionAnimations[3].translateY }],
              marginBottom: 20,
            }
          ]}
        >
          <Text style={styles.sectionTitle}>More Services</Text>
          <View style={styles.servicesGrid}>
            {renderServiceItem('Hospitals', { component: MaterialIcons, name: 'local-hospital' }, '#FF9900', 0, 3)}
            {renderServiceItem('Clubs and associations', { component: MaterialIcons, name: 'groups' }, '#FF9900', 1, 3)}
            {renderServiceItem('Donation', { component: MaterialCommunityIcons, name: 'hand-heart' }, '#FF9900', 2, 3)}
            {renderServiceItem('Education fees', { component: MaterialIcons, name: 'school' }, '#FF9900', 3, 3)}
            {renderServiceItem('Subscription', { component: MaterialIcons, name: 'subscriptions' }, '#FF9900', 4, 3)}
            {renderServiceItem('Rental', { component: MaterialIcons, name: 'home' }, '#FF9900', 5, 3)}
            {renderServiceItem('NCMC recharge', { component: MaterialCommunityIcons, name: 'card-account-details' }, '#FF9900', 6, 3)}
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 32) / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight,
    position: 'relative', // For absolute positioned snowflakes
  },
  snowflakesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Above content but below interactive elements
    pointerEvents: 'none', // Don't interfere with touch events
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#222222',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  gameCardContainer: {
    height: 180, // Increased height
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 12, // Increased elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  gameCard: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#1E3A8A', // Base color
    overflow: 'hidden',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden',
    padding: 16,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E3A8A',
    borderWidth: 0,
    // Multi-layered background with linear gradients would be preferred
    // Simplified version with a blue gradient-like effect:
    borderTopWidth: 80,
    borderTopColor: 'rgba(30, 58, 138, 0.7)',
    borderRightWidth: 90,
    borderRightColor: 'rgba(14, 30, 80, 0.9)',
    borderBottomWidth: 100,
    borderBottomColor: 'rgba(10, 25, 70, 0.95)',
    borderLeftColor: 'rgba(20, 40, 120, 0.8)',
    borderLeftWidth: 60,
  },
  snowPatternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
    borderWidth: 30,
    borderColor: 'transparent',
    borderTopColor: '#ffffff',
    borderRadius: 16,
    transform: [{ rotate: '45deg' }, { scale: 2 }],
  },
  decorationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  sparkle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeSnowflake: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
    marginTop: 20,
  },
  textContainer: {
    flex: 1,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    zIndex: 5,
  },
  boostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  boostText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 4,
  },
  gameTitleText: {
    fontSize: 26, // Larger
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameSubtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  playButtonContainer: {
    alignItems: 'center', // Center align
    marginTop: 16,
    zIndex: 5,
  },
  playButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%', // Fixed width
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 5,
  },
  cardBack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 16,
    overflow: 'hidden',
  },
  cardBackGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0EEFF', // Light blue base
    borderWidth: 0,
    // Multi-layered gradient effect:
    borderTopWidth: 40,
    borderTopColor: '#F0F7FF',
    borderRightWidth: 80,
    borderRightColor: '#E8F1FF',
    borderBottomWidth: 120,
    borderBottomColor: '#D8E8FF',
    borderLeftColor: '#ECF4FF',
    borderLeftWidth: 60,
  },
  frostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gameCompletedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    width: '100%',
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  trophyGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 35,
    zIndex: -1,
  },
  gameCompletedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  gameRewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A8EE6',
    marginTop: 5,
  },
  gameRewardInstructions: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 2,
    marginBottom: 12,
  },
  claimRewardButton: {
    backgroundColor: '#3A8EE6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  claimRewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222222',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  serviceItem: {
    width: itemWidth,
    marginBottom: 20,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  serviceButton: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#444444',
    width: '100%',
  },
});

export default Billings;