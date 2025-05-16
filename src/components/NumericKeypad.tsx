import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const NumericKeypad: React.FC<Props> = ({ onKeyPress, onDelete, disabled = false }) => {
  const handleKeyPress = (key: string) => {
    Vibration.vibrate(40); // Vibrate for 50ms
    onKeyPress(key);
  };

  const renderKey = (key: string | number) => (
    <TouchableOpacity
      style={[styles.key, disabled && styles.keyDisabled]}
      onPress={() => handleKeyPress(key.toString())}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>{key}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderKey(1)}
        {renderKey(2)}
        {renderKey(3)}
      </View>
      <View style={styles.row}>
        {renderKey(4)}
        {renderKey(5)}
        {renderKey(6)}
      </View>
      <View style={styles.row}>
        {renderKey(7)}
        {renderKey(8)}
        {renderKey(9)}
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.bottomKeysContainer}>
          {renderKey(0)}
          <TouchableOpacity
            style={[styles.key, styles.deleteKey, disabled && styles.keyDisabled]}
            onPress={() => {
              Vibration.vibrate(50); // Vibrate for 50ms
              onDelete();
            }}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Icon name="backspace-outline" size={24} color={disabled ? "rgba(255, 255, 255, 0.3)" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const keySize = Math.min((width - 120) / 3, 75); // Increased max size to 75

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bottomRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomKeysContainer: {
    flexDirection: 'row',
    width: keySize * 2 + 24, // Slightly increased gap
    justifyContent: 'space-between',
  },
  key: {
    width: keySize,
    height: keySize,
    borderRadius: keySize / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteKey: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 28, // Increased font size
    fontWeight: '400',
  },
  keyDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  keyTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

export default NumericKeypad;