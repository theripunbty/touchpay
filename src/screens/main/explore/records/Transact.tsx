import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

type Transaction = {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  amount: number;
  category: 'personal' | 'business';
  cardNumber: string;
  icon: React.ReactNode;
};

const Transact: React.FC<Props> = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState<string>('FEBRUARY, 2025');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const transactions: Transaction[] = [
    {
      id: '1',
      date: new Date(2025, 1, 16),
      title: 'Ripun Store',
      subtitle: 'Merchant',
      amount: -60.00 * 75,
      category: 'business',
      cardNumber: '9567',
      icon: (
        <Icon name="arrow-downward" size={20} color="#ffffff" />
      ),
    },
    {
      id: '2',
      date: new Date(2025, 1, 15),
      title: 'Replenishment from another card',
      subtitle: 'Refill',
      amount: 110.09,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="arrow-upward" size={20} color="#ffffff" />
      ),
    },
    {
      id: '3',
      date: new Date(2025, 1, 15),
      title: 'Coffee Shop',
      subtitle: 'Food & Drink',
      amount: -15.00 * 75,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="local-cafe" size={20} color="#ffffff" />
      ),
    },
    {
      id: '4',
      date: new Date(2025, 1, 14),
      title: 'Salary Deposit',
      subtitle: 'Income',
      amount: 2500.00 * 75,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="arrow-upward" size={20} color="#ffffff" />
      ),
    },
    {
      id: '5',
      date: new Date(2025, 1, 14),
      title: 'Uber Ride',
      subtitle: 'Transportation',
      amount: -32.50 * 75,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="directions-car" size={20} color="#ffffff" />
      ),
    },
    {
      id: '6',
      date: new Date(2025, 1, 13),
      title: 'Amazon',
      subtitle: 'Shopping',
      amount: -89.99 * 75,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="shopping-cart" size={20} color="#ffffff" />
      ),
    },
    {
      id: '7',
      date: new Date(2025, 1, 12),
      title: 'Netflix Subscription',
      subtitle: 'Entertainment',
      amount: -14.99 * 75,
      category: 'personal',
      cardNumber: '9567',
      icon: (
        <Icon name="tv" size={20} color="#ffffff" />
      ),
    },
  ];

  const getIconGradientColors = (transaction: Transaction) => {
    if (transaction.amount > 0) {
      return ['#45B7A9', '#4ECDC4', '#5ADFD6']; // Green gradient for income
    } else {
      switch (transaction.subtitle.toLowerCase()) {
        case 'food & drink':
          return ['#FF9F1C', '#FFA93A', '#FFB356']; // Orange gradient
        case 'transportation':
          return ['#6A4CD8', '#7A5AF8', '#8A68FF']; // Purple gradient
        case 'entertainment':
        case 'merchant':
        case 'shopping':
          return ['#FF4A6D', '#FF5E7D', '#FF728D']; // Red/Pink gradient
        default:
          return ['#424242', '#616161', '#757575']; // Gray gradient for others
      }
    }
  };

  const renderTransactionItem = (transaction: Transaction) => {
    return (
      <View style={styles.transactionItem} key={transaction.id}>
        <LinearGradient
          colors={getIconGradientColors(transaction)}
          style={styles.transactionIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {transaction.icon}
        </LinearGradient>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
        </View>
        <View>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.amount > 0 ? '#4ECDC4' : '#FF5E7D' }
          ]}>
            {transaction.amount > 0 ? '+' : '-'} ₹ {Math.abs(transaction.amount).toLocaleString('en-US')}
          </Text>
          <Text style={styles.transactionDate}>
            {transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderMenuDropdown = () => {
    if (!menuVisible) return null;
    
    return (
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Icon name="search" size={20} color="#333" />
              <Text style={styles.menuItemText}>Search Transactions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Icon name="description" size={20} color="#333" />
              <Text style={styles.menuItemText}>Get Statement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Icon name="file-download" size={20} color="#333" />
              <Text style={styles.menuItemText}>Download CSV</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Icon name="filter-list" size={20} color="#333" />
              <Text style={styles.menuItemText}>Advanced Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Icon name="settings" size={20} color="#333" />
              <Text style={styles.menuItemText}>Payment Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => setMenuVisible(true)}>
            <Icon name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Menu Dropdown */}
        {renderMenuDropdown()}

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Month Selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity style={styles.monthButton}>
              <Icon name="chevron-left" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <TouchableOpacity style={styles.monthButton}>
              <Icon name="chevron-right" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Legend Container */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.legendText}>Received</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF5E7D' }]} />
              <Text style={styles.legendText}>Transferred</Text>
            </View>
          </View>

          {/* Recent Transactions Header */}
          {/* <Text style={styles.sectionHeader}>RECENT TRANSACTIONS</Text> */}

          {/* Transactions List */}
          <View style={styles.transactionsList}>
            {transactions.map(transaction => renderTransactionItem(transaction))}
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginHorizontal: 16,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.8)',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  transactionsList: {
    paddingHorizontal: 16,
    marginTop: 40
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.75)',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.75)',
    textAlign: 'right',
    marginTop: 4,
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: '#222222',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
});

export default Transact;