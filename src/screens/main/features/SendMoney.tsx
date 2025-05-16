import React, { useState, useCallback, useEffect } from 'react';
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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NFCBottomSheet from '@components/NFCBottomSheet';

interface PaymentOption {
  id: string;
  label: string;
}

const SendMoney: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('contact');
  const [isNFCBottomSheetVisible, setIsNFCBottomSheetVisible] = useState(false);
  const [isNFCSupported, setIsNFCSupported] = useState<boolean | null>(null);

  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 1000000;

  const paymentOptions: PaymentOption[] = [
    { id: 'tap', label: 'Tap to Pay' },
    { id: 'contact', label: 'Send to Number' },
  ];

  // Check if NFC is supported
  useEffect(() => {
    const checkNFCSupport = async () => {
      try {
        // Check platform specific NFC support
        if (Platform.OS === 'android') {
          // Mock the check for now to avoid the error
          setIsNFCSupported(false);
          
          // In a real app with proper NFC module, you would use:
          /*
          const { NfcManager } = NativeModules;
          if (NfcManager) {
            const isSupported = await NfcManager.isSupported();
            setIsNFCSupported(isSupported);
          } else {
            setIsNFCSupported(false);
          }
          */
        } else if (Platform.OS === 'ios') {
          // Mock the check for now to avoid the error
          setIsNFCSupported(false);
          
          // In a real app with proper NFC module, you would use:
          /*
          const { NFCReader } = NativeModules;
          if (NFCReader) {
            const isSupported = await NFCReader.isSupported();
            setIsNFCSupported(isSupported);
          } else {
            // If NFCReader module doesn't exist, try to determine by device model
            const majorVersionString = Platform.Version.toString().split('.')[0];
            const majorVersion = parseInt(majorVersionString, 10);
            // iOS 13+ on iPhone 7 and newer supports NFC
            setIsNFCSupported(majorVersion >= 13);
          }
          */
        } else {
          setIsNFCSupported(false);
        }
      } catch (error) {
        console.error('Error checking NFC support:', error);
        setIsNFCSupported(false);
      }
    };

    checkNFCSupport();
  }, []);

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
        return;
      }

      // Handle regular number input
      newAmount = amount + num;
      const numericValue = parseFloat(newAmount);

      if (!isNaN(numericValue)) {
        if (numericValue > MAX_AMOUNT) {
          return;
        }

        if (amount.includes('.')) {
          const decimalDigits = newAmount.split('.')[1];
          if (decimalDigits && decimalDigits.length > 2) {
            return;
          }
        }

        setAmount(newAmount);
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

  const formatAmount = useCallback(() => {
    if (amount === '') return '₹ 0'; // Default placeholder
    return `₹ ${amount}`; // Display the amount as is
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
            <Text style={styles.keypadButtonText}>{value}</Text>
          ) : (
            value
          )}
        </TouchableOpacity>
      );
    },
    [handleBackspace, handleNumberPress]
  );

  // Handle Transfer Button Press
  const handleTransferButtonPress = useCallback(() => {
    if (selectedOption === 'tap') {
      setIsNFCBottomSheetVisible(true); 
    } else if (selectedOption === 'contact') {
      navigation.navigate('MyContacts');
    }
  }, [selectedOption, navigation]);

  // Hide NFC Bottom Sheet
  const hideNFCBottomSheet = useCallback(() => {
    setIsNFCBottomSheetVisible(false);
  }, []);

  // Render NFC Not Supported Message
  const renderNFCNotSupportedMessage = () => {
    return (
      <View style={styles.nfcNotSupportedContainer}>
        <View style={styles.nfcIconContainer}>
          <MaterialIcons name="contactless" size={48} color="#E5E5E5" />
          <View style={styles.nfcIconCross}>
            <MaterialIcons name="close" size={22} color="#FF6B6B" />
          </View>
        </View>
        <Text style={styles.nfcNotSupportedTitle}>NFC Not Available</Text>
        <Text style={styles.nfcNotSupportedText}>
          Your device doesn't support Tap to Pay.
        </Text>
        <TouchableOpacity 
          style={styles.switchOptionButton}
          onPress={() => setSelectedOption('contact')}
        >
          <Text style={styles.switchOptionButtonText}>Use Send to Number</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Amount</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Text>
            <MaterialIcons name="info-outline" size={24} color="#000" />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Options */}
      <View style={styles.paymentOptionsContainer}>
        <Text style={styles.paymentOptionsTitle}>Payment options</Text>
        <View style={styles.paymentOptions}>
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paymentOption,
                selectedOption === option.id && styles.selectedPaymentOption,
                option.id === 'tap' && isNFCSupported === false && styles.disabledPaymentOption,
              ]}
              onPress={() => {
                // Prevent selecting tap option if NFC is not supported
                if (option.id === 'tap' && isNFCSupported === false) {
                  return;
                }
                setSelectedOption(option.id);
              }}
            >
              <View style={styles.paymentOptionIcon}>
                {option.id === 'tap' && (
                  <Text>
                    <MaterialIcons
                      name="contactless"
                      size={24}
                      color={selectedOption === option.id ? '#FFF' : (isNFCSupported === false ? '#999' : '#000')}
                    />
                  </Text>
                )}
                {option.id === 'contact' && (
                  <Text>
                    <MaterialIcons
                      name="contact-page"
                      size={24}
                      color={selectedOption === option.id ? '#FFF' : '#000'}
                    />
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.paymentOptionText,
                  selectedOption === option.id && styles.selectedPaymentOptionText,
                  option.id === 'tap' && isNFCSupported === false && styles.disabledPaymentOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amount Display - Only show when not tap or NFC is supported */}
      {!(selectedOption === 'tap' && isNFCSupported === false) && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{formatAmount()}</Text>
          <View style={styles.cursor}></View>
        </View>
      )}

      {/* Keypad or NFC Not Supported Message */}
      {selectedOption === 'tap' && isNFCSupported === false ? (
        renderNFCNotSupportedMessage()
      ) : (
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
              <MaterialIcons name="backspace" size={24} color="#000" />
            )}
          </View>
        </View>
      )}

      {/* Transfer Button */}
      <TouchableOpacity
        style={[
          styles.transferButton,
          parseFloat(amount || '0') < MIN_AMOUNT && styles.disabledButton,
          selectedOption === 'tap' && isNFCSupported === false && styles.disabledButton,
        ]}
        onPress={handleTransferButtonPress}
        disabled={
          parseFloat(amount || '0') < MIN_AMOUNT || 
          (selectedOption === 'tap' && isNFCSupported === false)
        }
      >
        <Text style={styles.transferButtonText}>Send Money</Text>
      </TouchableOpacity>

      {/* NFC Bottom Sheet */}
      <NFCBottomSheet
        amount={amount || '0'}
        isVisible={isNFCBottomSheetVisible}
        onClose={hideNFCBottomSheet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  paymentOptionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  selectedPaymentOption: {
    backgroundColor: '#1A1A1A',
  },
  paymentOptionIcon: {
    marginRight: 4,
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  selectedPaymentOptionText: {
    color: '#FFFFFF',
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
  },
  cursor: {
    width: 2,
    height: 40,
    backgroundColor: '#000',
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
    backgroundColor: '#F5F5F5',
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
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledPaymentOption: {
    backgroundColor: '#F0F0F0',
    opacity: 0.7,
  },
  disabledPaymentOptionText: {
    color: '#999999',
  },
  nfcNotSupportedContainer: {
    marginTop: 10,
    marginHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 260,
  },
  nfcIconContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 35,
  },
  nfcIconCross: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  nfcNotSupportedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nfcNotSupportedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  switchOptionButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 6,
    width: '90%',
    alignItems: 'center',
  },
  switchOptionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default React.memo(SendMoney);