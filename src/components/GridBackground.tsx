import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40; // Size of each grid cell

interface GridBackgroundProps {
  children: React.ReactNode;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the grid lines
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderVerticalLines = () => {
    const lines = [];
    const numberOfLines = Math.ceil(width / GRID_SIZE);

    for (let i = 0; i <= numberOfLines; i++) {
      lines.push(
        <Animated.View
          key={`vertical-${i}`}
          style={[
            styles.line,
            styles.verticalLine,
            {
              left: i * GRID_SIZE,
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.14)',
              'rgba(255,255,255,0.10)',
              'rgba(255,255,255,0.02)',
              'rgba(255,255,255,0)',
            ]}
            locations={[0, 0.3, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      );
    }
    return lines;
  };

  const renderHorizontalLines = () => {
    const lines = [];
    const numberOfLines = Math.ceil(height / GRID_SIZE);

    for (let i = 0; i <= numberOfLines; i++) {
      const opacity = 1 - i / numberOfLines;
      lines.push(
        <Animated.View
          key={`horizontal-${i}`}
          style={[
            styles.line,
            styles.horizontalLine,
            {
              top: i * GRID_SIZE,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.horizontalLineInner, { opacity: opacity * 0.08 }]} />
        </Animated.View>
      );
    }
    return lines;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#080808']}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.gridContainer}>
          {renderVerticalLines()}
          {renderHorizontalLines()}
        </View>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.09)',
            'rgba(0, 0, 0, 0.3)',
            'rgba(0,0,0,0.2)',
            'rgba(0,0,0,0)',
          ]}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </LinearGradient>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: 'absolute',
    overflow: 'hidden',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  horizontalLineInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  }
});

export default GridBackground;