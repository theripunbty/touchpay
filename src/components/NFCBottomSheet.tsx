import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface NFCBottomSheetProps {
  amount: string;
  isVisible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const NFCBottomSheet: React.FC<NFCBottomSheetProps> = ({
  amount,
  isVisible,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const outerScale = useRef(new Animated.Value(1)).current;
  const middleScale = useRef(new Animated.Value(1)).current;
  const innerScale = useRef(new Animated.Value(1)).current;

  // Stop all animations and close the sheet immediately
  const handleCancel = useCallback(() => {
    // Stop all animations
    slideAnim.stopAnimation();
    outerScale.stopAnimation();
    middleScale.stopAnimation();
    innerScale.stopAnimation();

    // Reset animation values
    slideAnim.setValue(height);
    outerScale.setValue(1);
    middleScale.setValue(1);
    innerScale.setValue(1);

    // Close the sheet immediately
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse effect for circles
      const pulseAnimation = (animatedValue: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1.2, // Expand slightly
              duration: 800,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1, // Back to normal
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      pulseAnimation(outerScale, 0);
      pulseAnimation(middleScale, 200);
      pulseAnimation(innerScale, 400);
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Hold your phone near the receiver
        </Text>

        <View style={styles.nfcContainer}>
          <Animated.View
            style={[
              styles.nfcOuterCircle,
              { transform: [{ scale: outerScale }] },
            ]}
          >
            <Animated.View
              style={[
                styles.nfcMiddleCircle,
                { transform: [{ scale: middleScale }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.nfcInnerCircle,
                  { transform: [{ scale: innerScale }] },
                ]}
              >
                <MaterialIcons name="contactless" size={30} color="white" />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </View>

        <Text style={styles.amountText}>₹ {amount}</Text>
        <Text style={styles.readyText}>Ready to send</Text>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8} // Slightly reduce opacity on press
        >
          <MaterialIcons name="close" size={20} color="white" />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    marginBottom: 30,
    fontWeight: "500"
  },
  nfcContainer: {
    width: '95%',
    height: height * 0.3,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  nfcOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcMiddleCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  readyText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 40,
    marginTop: 20,
    fontWeight: "500"
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '90%',
    position: 'absolute',
    bottom: 40,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default NFCBottomSheet;