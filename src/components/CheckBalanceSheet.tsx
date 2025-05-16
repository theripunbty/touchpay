import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface CheckBalanceSheetProps {
  isVisible: boolean;
  onClose: () => void;
  bankLogo: string;
  accountNumber: string;
  accountType: string;
  balance: string;
}

const CheckBalanceSheet: React.FC<CheckBalanceSheetProps> = ({
  isVisible,
  onClose,
  bankLogo,
  accountNumber,
  accountType,
  balance,
}) => {
  const maskAccountNumber = (number: string) => {
    const visibleDigits = 4;
    const masked = number.slice(-visibleDigits).padStart(number.length, '•');
    return masked.replace(/(.{4})/g, '$1 ');
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.content}>
            <View style={styles.bankInfo}>
              <Image
                source={{ uri: bankLogo }}
                style={styles.bankLogo}
                resizeMode="contain"
              />
              <View style={styles.accountInfo}>
                <Text style={styles.accountType}>{accountType}</Text>
                <Text style={styles.accountNumber}>{maskAccountNumber(accountNumber)}</Text>
              </View>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceAmount}>₹ {balance}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 12,
    minHeight: 90,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dragHandle: {
    width: 32,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    position: 'absolute',
    top: -4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    paddingHorizontal: 10,
  },
  bankLogo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  accountType: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  accountNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
  },
});

export default CheckBalanceSheet; 