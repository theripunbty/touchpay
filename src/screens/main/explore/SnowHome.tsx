import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const { width, height } = Dimensions.get('window');

// Set the sensor update interval
setUpdateIntervalForType(SensorTypes.accelerometer, 100);

// Shake detection threshold
const SHAKE_THRESHOLD = 2.7;

interface SnowHomeProps {
  navigation: any;
}

const SnowHome: React.FC<SnowHomeProps> = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  
  // Wave animation
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  
  // Slider animation
  const sliderAnim = useRef(new Animated.Value(0)).current;
  
  // State for the number of snowflakes
  const [snowflakeCount, setSnowflakeCount] = useState(12);
  const [isSnowIntensified, setIsSnowIntensified] = useState(false);
  
  // Create multiple snowfall animations with optimized performance
  const snowAnimations = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      y: new Animated.Value(-Math.random() * 100),
      x: Math.random() * (width - 60) + 30,
      size: Math.max(Math.floor(Math.random() * 8) + 4, 5), // Use integer sizes
      speed: Math.floor(Math.random() * 5000 + 5000), // Slower but smoother
      opacity: Math.round((Math.random() * 0.3 + 0.3) * 10) / 10, // Reduce decimal precision
    }));
  }, []);
  
  // Create card snowflake animations with optimized performance
  const cardSnowAnimations = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      y: new Animated.Value(0),
      x: Math.floor(Math.random() * 80 + 10), // Use integer values when possible
      y_pos: Math.floor(Math.random() * 80 + 10),
      size: Math.max(Math.floor(Math.random() * 8) + 4, 5), // Use integer sizes
      speed: Math.floor(Math.random() * 1500 + 2000), // Adjusted for smoother animation
      opacity: Math.round((Math.random() * 0.4 + 0.2) * 10) / 10, // Reduce decimal precision
    }));
  }, []);

  // Create optimized snowflake component for better performance
  const SnowflakeIcon = useCallback(({ size, color }: { size: number, color: string }) => (
    <MaterialIcons 
      name="ac-unit" 
      size={size} 
      color={color} 
    />
  ), []);

  // Handle accelerometer data for shake detection
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;
    let shakeCount = 0;
    let shakeTimeout: NodeJS.Timeout | null = null;
    
    const subscription = accelerometer.subscribe(({ x, y, z }) => {
      const currentTime = new Date().getTime();
      
      // Only process if enough time has passed between updates
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;
        
        // Calculate movement
        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > SHAKE_THRESHOLD) {
          // Count this as a shake
          shakeCount++;
          
          // After 2 quick shakes, trigger snow intensification
          if (shakeCount > 1 && !isSnowIntensified) {
            intensifySnowfall();
            
            // Reset shake count
            shakeCount = 0;
          }
          
          // Reset shake count after some time without shakes
          if (shakeTimeout) {
            clearTimeout(shakeTimeout);
          }
          
          shakeTimeout = setTimeout(() => {
            shakeCount = 0;
          }, 1000);
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      if (shakeTimeout) clearTimeout(shakeTimeout);
    };
  }, [isSnowIntensified]);
  
  // Function to intensify snowfall on shake
  const intensifySnowfall = () => {
    setIsSnowIntensified(true);
    setSnowflakeCount(40); // Increase snowflake count
    
    // Reset after some time
    setTimeout(() => {
      setIsSnowIntensified(false);
      setSnowflakeCount(12);
    }, 10000); // Back to normal after 10 seconds
  };

  // Start all animations
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    // Wave animation sequence
    Animated.loop(
      Animated.stagger(300, [
        Animated.sequence([
          Animated.timing(wave1Anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(wave1Anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          })
        ]),
        Animated.sequence([
          Animated.timing(wave2Anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(wave2Anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          })
        ]),
        Animated.sequence([
          Animated.timing(wave3Anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(wave3Anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          })
        ])
      ])
    ).start();
    
    // Slider animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sliderAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
        Animated.timing(sliderAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        })
      ])
    ).start();
    
    // Distribute animation starts over time to prevent performance spikes
    snowAnimations.forEach((snow, index) => {
      // Start from different positions to create continuous effect
      snow.y.setValue(-Math.random() * height);
      
      // Stagger animation starts
      setTimeout(() => {
        // Create loop animation with slow, continuous movement
        Animated.loop(
          Animated.timing(snow.y, {
            toValue: height,
            duration: snow.speed,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ).start();
      }, index * 50); // Stagger by 50ms per snowflake
    });
    
    // Start card snowfall with continuous effect
    startCardSnowfall();
  }, []);
  
  // Update card snowfall speed when intensity changes, but maintain continuous appearance
  useEffect(() => {
    // When intensity changes, update animation speed but don't reset positions
    updateCardSnowfallSpeed();
  }, [isSnowIntensified]);
  
  // Function to start card snowfall with continuous effect - optimized
  const startCardSnowfall = () => {
    // Stagger animation starts to distribute load
    cardSnowAnimations.forEach((snow, index) => {
      // Set initial random positions within the card
      snow.y.setValue(Math.random() * 50);
      
      // Delay start slightly based on index to prevent all animations starting at once
      setTimeout(() => {
        // Create continuous falling effect
        Animated.loop(
          Animated.timing(snow.y, {
            toValue: 50,
            duration: isSnowIntensified ? Math.random() * 1000 + 1500 : Math.random() * 1500 + 2500,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ).start();
      }, index * 50); // Stagger by 50ms per snowflake
    });
  };
  
  // Function to update card snowfall speed without interrupting animation
  const updateCardSnowfallSpeed = () => {
    cardSnowAnimations.forEach((snow, index) => {
      // Get current value
      snow.y.stopAnimation((value) => {
        // Restart animation from current position with new speed
        Animated.loop(
          Animated.timing(snow.y, {
            toValue: 50,
            duration: isSnowIntensified ? Math.random() * 1000 + 1000 : Math.random() * 2000 + 2000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ).start();
      });
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Snowfall overlay for entire screen - optimized */}
      {snowAnimations.slice(0, snowflakeCount).map((snow, index) => (
        <Animated.View 
          key={`snow-${index}`}
          style={[
            styles.snowflake,
            {
              left: snow.x,
              opacity: snow.opacity,
              transform: [{ translateY: snow.y }],
              width: snow.size,
              height: snow.size,
            }
          ]}
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
        >
          <MaterialIcons 
            name="ac-unit" 
            size={snow.size} 
            color={isSnowIntensified ? "rgba(200,200,255,0.9)" : "rgba(180,180,255,0.8)"} 
          />
        </Animated.View>
      ))}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>snow park</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => {
              Vibration.vibrate(100);
              intensifySnowfall();
            }} // Vibrate on click
          >
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1746203887/oliveit/registrations/yuae5vufae2k8uwrtoit.jpg' }} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </View>
        
        <Animated.View 
          style={[
            styles.cardsContainer, 
            { 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideUpAnim }
              ] 
            }
          ]}
        >
          {/* Top row */}
          <View style={styles.cardRow}>
            {/* Play & Win Card */}
            <TouchableOpacity 
              style={[styles.card, styles.cardSmall]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Game')}
            >
              <LinearGradient
                colors={['#3a2db9', '#9c3fd0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardGradient}
              >
                <Text style={styles.cardLabel}>PLAY & WIN</Text>
                <View style={styles.snowTextContainer}>
                  <Text style={styles.snowText}>2x{'\n'}cashback</Text>
                </View>
                
                <View style={styles.winterStormContainer}>
                  <Text style={styles.winterStormText}>Winter Rush</Text>
                </View>
                
                {/* Falling snow elements inside card - optimized for performance */}
                {cardSnowAnimations.slice(0, isSnowIntensified ? 16 : 8).map((snow, index) => (
                  <Animated.View 
                    key={`card-snow-${index}`}
                    style={[
                      styles.cardSnowflake,
                      {
                        left: `${snow.x}%`,
                        top: `${snow.y_pos}%`,
                        opacity: snow.opacity,
                        transform: [{ translateY: snow.y }]
                      }
                    ]}
                    renderToHardwareTextureAndroid
                    shouldRasterizeIOS
                  >
                    <MaterialIcons 
                      name="ac-unit" 
                      size={snow.size} 
                      color={isSnowIntensified ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)"} 
                    />
                  </Animated.View>
                ))}
              </LinearGradient>
            </TouchableOpacity>
            
            {/* May Spends Card */}
            <TouchableOpacity 
              style={[styles.card, styles.cardSmall]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Transact')}
            >
              <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardGradient}
              >
                <Text style={styles.cardLabel}>MY SPENDS</Text>
                <Text style={styles.cardTitle}>₹1,433</Text>
                <View style={styles.analyticsContainer}>
                  <Animated.View style={styles.zigzagArrow}>
                    {[...Array(5)].map((_, i) => (
                      <View 
                        key={`zag-${i}`}
                        style={[
                          styles.zigzagSegment,
                          { 
                            transform: [{ rotate: i % 2 === 0 ? '45deg' : '-45deg' }],
                            bottom: i * 10,
                            opacity: 1 - (i * 0.15)
                          }
                        ]}
                      />
                    ))}
                  </Animated.View>
                  <View style={styles.analyticsGrid}>
                    {[...Array(6)].map((_, i) => (
                      <View 
                        key={`grid-${i}`} 
                        style={[
                          styles.gridLine,
                          { opacity: 0.1 + (i * 0.1) }
                        ]} 
                      />
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Middle row */}
          <TouchableOpacity 
            style={[styles.card, styles.cardLarge]}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FF8008', '#FFA034', '#FF5733']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Add colorful abstract shapes in background */}
              <View style={styles.billsBackground}>
                <View style={[styles.billsShape, styles.billsCircle, { backgroundColor: '#FFDD00', opacity: 0.2 }]} />
                <View style={[styles.billsShape, styles.billsTriangle, { borderBottomColor: '#FF3D7F', opacity: 0.2 }]} />
                <View style={[styles.billsShape, styles.billsRectangle, { backgroundColor: '#FFC107', opacity: 0.25 }]} />
              </View>
              
              <Text style={[styles.cardLabel, { color: '#FFFFFF' }]}>ELECTRICITY, GAS, MOBILE & MORE</Text>
              <View style={styles.billsContainer}>
                <View style={styles.billsTextContainer}>
                  <Text style={styles.billsTitle}>Pay bills</Text>
                  <Text style={styles.billsSubtitle}>instantly</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Bottom row */}
          <View style={styles.cardRow}>
            {/* Invite Card */}
            <TouchableOpacity 
              style={[styles.card, styles.cardSmall]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#ff5252', '#ff7676']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardGradient}
              >
                <Text style={styles.cardLabel}>INVITE</Text>
                <Text style={styles.cardTitle}>Earn upto</Text>
                <Text style={styles.cardSubtitle}>₹350</Text>

              </LinearGradient>
            </TouchableOpacity>
            
            {/* Autopay Card */}
            <TouchableOpacity 
              style={[styles.card, styles.cardSmall]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#2196f3', '#2196f3']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardLabel}>AUTOPAY</Text>
                <Text style={styles.cardTitle}>0 Active</Text>
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderTrack}>
                    <Animated.View 
                      style={[
                        styles.sliderThumb,
                        {
                          transform: [{ 
                            translateX: sliderAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, width * 0.28]
                            })
                          }]
                        }
                      ]} 
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: StatusBar.currentHeight,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#000000',
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cardsContainer: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardSmall: {
    width: (width - 50) / 2,
    height: width * 0.42,
  },
  cardLarge: {
    width: '100%',
    height: width * 0.42,
    marginBottom: 20,
  },
  cardGradient: {
    padding: 20,
    flex: 1,
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  snowTextContainer: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  snowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
  winterStormContainer: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  winterStormText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  // Snowfall styles
  snowflake: {
    position: 'absolute',
    zIndex: 100,
    pointerEvents: 'none',
  },
  cardSnowflake: {
    position: 'absolute',
    zIndex: 1,
    pointerEvents: 'none',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 10,
    borderRadius: 2,
  },
  billsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 12,
    width: '100%',
  },
  billsTextContainer: {
    flexShrink: 1,
    width: '100%',
    alignItems: 'flex-start',
  },
  billsTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 38,
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  billsSubtitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 38,
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  envelopeContainer: {
    position: 'absolute',
    right: 16,
    bottom: 30,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: -6,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  analyticsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  zigzagArrow: {
    position: 'absolute',
    right: 30,
    bottom: 0,
    width: 30,
    height: 70,
    zIndex: 2,
  },
  zigzagSegment: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 1,
    right: 0,
  },
  analyticsGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    justifyContent: 'space-between',
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
  billsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  billsShape: {
    position: 'absolute',
    opacity: 0.15,
  },
  billsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF3D7F',
    top: -30,
    right: -20,
  },
  billsTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 70,
    borderRightWidth: 70,
    borderBottomWidth: 120,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFC300',
    transform: [{ rotate: '30deg' }],
    bottom: -50,
    left: -30,
  },
  billsRectangle: {
    width: 80,
    height: 80,
    backgroundColor: '#3498DB',
    transform: [{ rotate: '45deg' }],
    right: 80,
    bottom: 10,
  },
});

export default SnowHome;
