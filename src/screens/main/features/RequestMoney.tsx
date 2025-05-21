import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Vibration,
  NativeModules,
  Image,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RequestMoney: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [amount, setAmount] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('contact');
  
  // Animation value for shake effect
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 500000; // 5 lakhs

  const handleNumberPress = useCallback(
    (num: string) => {
      Vibration.vibrate(10);
      let newAmount = amount;

      if (num === '0' && amount === '') {
        return;
      }

      if (num === '.' && amount === '') {
        return;
      }

      if (num === '.') {
        if (parseFloat(amount) >= MAX_AMOUNT) {
          return;
        }
        if (!amount.includes('.')) {
          newAmount = amount === '' ? '0.' : amount + '.';
        }
        setAmount(newAmount);
        setErrorMessage('');
        return;
      }

      // Handle regular number input
      newAmount = amount + num;
      const numericValue = parseFloat(newAmount);

      if (!isNaN(numericValue)) {
        if (numericValue > MAX_AMOUNT) {
          shakeAndVibrate();
          setErrorMessage(`Maximum amount is ₹5,00,000`);
          return;
        }

        if (amount.includes('.')) {
          const decimalDigits = newAmount.split('.')[1];
          if (decimalDigits && decimalDigits.length > 2) {
            return;
          }
        }

        setAmount(newAmount);
        setErrorMessage('');
      }
    },
    [amount]
  );

  const handleBackspace = useCallback(() => {
    Vibration.vibrate(10);
    if (amount.length === 0) return;

    let newAmount = amount.slice(0, -1);

    if (newAmount === '' || newAmount === '0') {
      setAmount('');
    } else {
      setAmount(newAmount);
    }
    setErrorMessage('');
  }, [amount]);

  const handleTransfer = useCallback(() => {
    const numericAmount = parseFloat(amount || '0');

    // Validate minimum amount
    if (numericAmount < MIN_AMOUNT) {
      // Alert.alert('Invalid Amount', `Minimum transfer amount is ₹${MIN_AMOUNT}`);
      return;
    }

    // Validate maximum amount
    if (numericAmount > MAX_AMOUNT) {
      // Alert.alert('Invalid Amount', `Maximum transfer amount is ₹${MAX_AMOUNT.toLocaleString('en-IN')}`);
      return;
    }

    // Proceed with transfer
    console.log('Transferring amount:', numericAmount);
    setAmount('');
  }, [amount]);

  // Shake animation function
  const shakeAndVibrate = () => {
    // Vibrate for 500ms
    Vibration.vibrate(500);
    
    // Reset animation value to ensure it works every time
    shakeAnimation.setValue(0);
    
    // Create a shake sequence with stronger movement
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  // Format amount with Indian number system (e.g., 10,00,000)
  const formatIndianNumber = (num: string | number) => {
    if (!num) return '0';
    
    // Convert to string and remove non-numeric characters except decimal
    const numStr = num.toString().replace(/[^0-9.]/g, '');
    
    // Split the number at decimal point
    const parts = numStr.split('.');
    
    // Get the integer part
    let integerPart = parts[0];
    
    // Format the integer part with commas (Indian system)
    // First comma after 3 digits from right, then every 2 digits
    let formattedInteger = '';
    
    // Handle the last 3 digits
    if (integerPart.length > 3) {
      formattedInteger = ',' + integerPart.substring(integerPart.length - 3);
      integerPart = integerPart.substring(0, integerPart.length - 3);
    } else {
      formattedInteger = integerPart;
      integerPart = '';
    }
    
    // Handle the rest of the digits in groups of 2
    while (integerPart.length > 0) {
      // Take last 2 digits if available, otherwise take what's left
      const chunk = integerPart.length >= 2 ? integerPart.substring(integerPart.length - 2) : integerPart;
      formattedInteger = ',' + chunk + formattedInteger;
      integerPart = integerPart.substring(0, integerPart.length - chunk.length);
    }
    
    // Remove leading comma if exists
    if (formattedInteger.startsWith(',')) {
      formattedInteger = formattedInteger.substring(1);
    }
    
    // Add decimal part if exists
    if (parts.length > 1) {
      return formattedInteger + '.' + parts[1];
    }
    
    return formattedInteger;
  };

  const formatAmount = useCallback(() => {
    if (amount === '') return (
      <>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.amountText}> 0</Text>
      </>
    );
    
    // Format with Indian number system
    const formattedAmount = formatIndianNumber(amount);
    
    return (
      <>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.amountText}> {formattedAmount}</Text>
      </>
    );
  }, [amount]);

  const renderKeypadButton = useCallback(
    (value: string | React.ReactNode) => {
      return (
        <TouchableOpacity
          style={styles.keypadButton}
          activeOpacity={0.7}
          onPress={() => {
            if (value === '⌫') {
              handleBackspace();
            } else if (typeof value === 'string') {
              handleNumberPress(value);
            } else if (React.isValidElement(value) && (value as React.ReactElement<{name: string}>).props.name === 'backspace') {
              handleBackspace();
            }
          }}
        >
          {typeof value === 'string' ? (
            <Text style={value === '.' ? styles.keypadDotText : styles.keypadButtonText}>{value}</Text>
          ) : (
            value
          )}
        </TouchableOpacity>
      );
    },
    [handleBackspace, handleNumberPress]
  );

  // Navigation handlers
  const handleCheckBalance = () => {
    // Navigate to balance screen
    navigation.navigate('CheckBalance');
  };

  const handleBorrow = () => {
    // Navigate to borrow screen
    navigation.navigate('Borrow');
  };

  // Override the handleTransferButtonPress to check amount and trigger shake
  const handleTransferButtonPress = useCallback(() => {
    const numericAmount = parseFloat(amount || '0');
    
    if (numericAmount === 0) {
      shakeAndVibrate();
      setErrorMessage('Please enter an amount');
      return;
    }
    
    if (numericAmount < MIN_AMOUNT) {
      shakeAndVibrate();
      setErrorMessage(`Minimum amount is ₹${MIN_AMOUNT}`);
      return;
    }
    
    if (numericAmount > MAX_AMOUNT) {
      shakeAndVibrate();
      setErrorMessage(`Maximum amount is ₹5,00,000`);
      return;
    }
    
    // Clear error if everything is valid
    setErrorMessage('');
    
    // Navigate to RequestMoneyForum page with the amount
    navigation.navigate('RequestMoneyForum', { amount: formatIndianNumber(amount) });
  }, [amount, navigation, formatIndianNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Money</Text>
        <View style={{width: 40}} />
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCheckBalance}
        >
          <Text style={styles.actionButtonText}>Check balance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleBorrow}
        >
          <Text style={styles.actionButtonText}>Borrow</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Display with shake animation */}
      <Animated.View 
        style={[
          styles.amountContainer,
          {transform: [{ translateX: shakeAnimation }]}
        ]}
      >
        {formatAmount()}
        <View style={styles.cursor}></View>
      </Animated.View>
      
      {/* Error message */}
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          {renderKeypadButton('1')}
          {renderKeypadButton('2')}
          {renderKeypadButton('3')}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('4')}
          {renderKeypadButton('5')}
          {renderKeypadButton('6')}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('7')}
          {renderKeypadButton('8')}
          {renderKeypadButton('9')}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('.')}
          {renderKeypadButton('0')}
          {renderKeypadButton(
            <MaterialIcons name="backspace" size={24} color="#fff" />
          )}
        </View>
      </View>

      {/* Transfer Button */}
      <TouchableOpacity
        style={[
          styles.transferButton,
          parseFloat(amount || '0') < MIN_AMOUNT && styles.disabledButton,
        ]}
        onPress={handleTransferButtonPress}
        disabled={parseFloat(amount || '0') < MIN_AMOUNT}
      >
        <Text style={styles.transferButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '48%',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  amountText: {
    fontSize: 40,
    fontWeight: '500',
    color: '#fff',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  cursor: {
    width: 2,
    height: 40,
    backgroundColor: '#fff',
    marginLeft: 4,
  },
  keypad: {
    paddingHorizontal: 16,
    marginTop: 60,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 2,
    borderRadius: 30,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
  },
  keypadDotText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    paddingBottom: 8,
    textAlign: 'center',
  },
  transferButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#333',
  },
  disabledButton: {
    backgroundColor: '#333333',
    borderColor: '#444444',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -30,
    marginBottom: 30,
  },
});

export default React.memo(RequestMoney);