import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  TextInput,
  Keyboard,
  Platform,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const UserPay = ({ navigation, route }: { navigation: any; route: any }) => {
  const [amount, setAmount] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState('');
  const COMMENT_MAX_LENGTH = 300;

  const recipient = {
    name: route?.params?.contactName || 'Annet Robson',
    avatar: route?.params?.contactPhoto || 'https://randomuser.me/api/portraits/women/32.jpg',
  };

  const categories = ['Movie', 'Restaurant', 'Groceries'];

  const MAX_AMOUNT = 500000;
  const MIN_AMOUNT = 1;

  // Handle numeric keypad press
  const handleKeyPress = (key: string) => {
    Vibration.vibrate(10);
    if (key === 'delete') {
      setAmount(prev => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    setAmount(prev => {
      // If current amount is just "0", replace it
      if (prev === '0' && key !== '.') return key;
      
      // Prevent multiple decimal points
      if (key === '.' && prev.includes('.')) return prev;
      
      // Ensure only 2 decimal places
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) return prev;
      }
      
      // Check if adding this digit would exceed MAX_AMOUNT
      let newAmount = prev + key;
      const numericAmount = parseFloat(newAmount) || 0;
      if (numericAmount > MAX_AMOUNT) {
        // If we're exceeding, don't update and show alert
        setTimeout(() => {
          // Alert.alert('Limit Exceeded', 'Maximum transaction amount is ₹5,00,000');
        }, 100);
        return prev;
      }
      
      return prev + key;
    });
  };

  // Format amount for display with ₹ sign
  const formattedAmount = () => {
    // Convert to number, handle possible formatting
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '0';
    
    // Format with 2 decimal places if there are decimals
    return numericAmount.toFixed(amount.includes('.') ? 2 : 0);
  };

  // Handle payment processing
  const processPayment = () => {
    Vibration.vibrate(20);
    Keyboard.dismiss();
    const numericAmount = parseFloat(amount) || 0;
    
    if (numericAmount < MIN_AMOUNT) {
      // Alert.alert('Invalid Amount', 'Minimum transaction amount is ₹1');
      return;
    }
    if (numericAmount > MAX_AMOUNT) {
      // Alert.alert('Limit Exceeded', 'Maximum transaction amount is ₹5,00,000');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('PaymentSuccess', {
        amount: formattedAmount(),
        recipientName: recipient.name,
      });
    }, 1500);
  };

  // Render numeric keypad key
  const renderKey = (value: string | number) => (
    <TouchableOpacity
      style={styles.keypadKey}
      onPress={() => handleKeyPress(value.toString())}
      activeOpacity={0.7}
    >
      <Text style={styles.keypadKeyText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LinearGradient
        colors={['#121212', '#121212', '#121212']}
        style={styles.container}
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer to</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Recipient Card */}
        <View style={styles.recipientCard}>
          <View style={styles.recipientInfoRow}>
            <Image
              source={{ uri: recipient.avatar }}
              style={styles.avatar}
            />
            <Text
              style={styles.recipientNameFull}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {recipient.name}
            </Text>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Set Amount</Text>
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.amountValue}>{amount}</Text>
          </View>
        </View>

        {/* Comment Input */}
        <TextInput
          style={styles.commentInput}
          placeholder="Write a note..."
          placeholderTextColor="#888"
          value={comment}
          onChangeText={text => {
            // Remove disallowed symbols
            let filtered = text.replace(/[^a-zA-Z0-9 =()]/g, '');
            // Limit to max length
            if (filtered.length > COMMENT_MAX_LENGTH) {
              filtered = filtered.slice(0, COMMENT_MAX_LENGTH);
            }
            setComment(filtered);
          }}
          maxLength={COMMENT_MAX_LENGTH}
        />
        {comment.length > 0 && (
          <Text style={styles.commentCount}>{comment.length} / {COMMENT_MAX_LENGTH}</Text>
        )}

        {/* Numeric Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            {renderKey(1)}
            {renderKey(2)}
            {renderKey(3)}
          </View>
          <View style={styles.keypadRow}>
            {renderKey(4)}
            {renderKey(5)}
            {renderKey(6)}
          </View>
          <View style={styles.keypadRow}>
            {renderKey(7)}
            {renderKey(8)}
            {renderKey(9)}
          </View>
          <View style={styles.keypadRow}>
            {renderKey('.')}
            {renderKey(0)}
            <TouchableOpacity
              style={styles.keypadKey}
              onPress={() => handleKeyPress('delete')}
              activeOpacity={0.7}
            >
              <Text style={styles.keypadKeyText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={processPayment}
          disabled={isProcessing || parseFloat(amount) < MIN_AMOUNT || parseFloat(amount) > MAX_AMOUNT}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>
            {isProcessing ? 'Processing...' : `Send ₹${formattedAmount()}`}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  recipientCard: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 14,
    padding: 8,
    marginBottom: 14,
    alignItems: 'center',
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  recipientTextContainer: {
    justifyContent: 'center',
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 1,
  },
  recipientNameFull: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 1,
    flex: 1,
    textAlign: 'left',
    marginLeft: 8,
  },
  bankName: {
    fontSize: 12,
    color: '#bbbbbb',
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardNumber: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  amountLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 5,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '500',
    color: '#ffffff',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
  },
  categoryOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
  },
  categoryButtonSelected: {
    backgroundColor: '#6657ff',
  },
  categoryText: {
    fontSize: 16,
    color: '#bbbbbb',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  commentInput: {
    backgroundColor: 'rgba(50, 50, 50, 0.3)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keypadContainer: {
    marginVertical: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  keypadKey: {
    width: (width - 120) / 3,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#6657ff',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  commentCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: -16,
    marginBottom: 12,
    marginRight: 4,
  },
});

export default UserPay;