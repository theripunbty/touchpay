import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ViewDetailsScreenNavigationProp } from '../../../../types/navigation';

// Loan Details interface
interface LoanDetails {
  id: string;
  amount: number;
  interest: number;
  totalPaid: number;
  term: string;
  interestRate: string;
  startDate: string;
  endDate: string;
  status: 'PAID' | 'ACTIVE' | 'OVERDUE';
  payments: Payment[];
}

// Payment interface
interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'REGULAR' | 'EARLY' | 'LATE';
}

interface Props {
  navigation: ViewDetailsScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'ViewDetails'>;
}

const ViewDetails: React.FC<Props> = ({ navigation, route }) => {
  // Default loan details in case none are passed
  const defaultLoanDetails: LoanDetails = {
    id: 'BORROW19283746',
    amount: 50000,
    interest: 1675,
    totalPaid: 51675,
    term: '6 months',
    interestRate: '6.5%',
    startDate: '15 Sep, 2022',
    endDate: '15 Mar, 2023',
    status: 'PAID',
    payments: [
      { id: 'PMT001', date: '15 Oct, 2022', amount: 8612, type: 'REGULAR' },
      { id: 'PMT002', date: '15 Nov, 2022', amount: 8612, type: 'REGULAR' },
      { id: 'PMT003', date: '15 Dec, 2022', amount: 8612, type: 'REGULAR' },
      { id: 'PMT004', date: '15 Jan, 2023', amount: 8612, type: 'REGULAR' },
      { id: 'PMT005', date: '15 Feb, 2023', amount: 8612, type: 'REGULAR' },
      { id: 'PMT006', date: '05 Mar, 2023', amount: 8615, type: 'EARLY' },
    ]
  };

  // Get loan details from route params or use default
  const loanDetails = route.params?.loanDetails || defaultLoanDetails;

  // Format amount with Indian numbering system
  const formatAmount = (amount: number) => {
    // Convert to string
    const numStr = amount.toString();
    
    // For numbers less than 1000, no formatting needed
    if (numStr.length <= 3) {
      return '₹' + numStr;
    }
    
    // Format according to Indian numbering system (lakhs, crores)
    let formattedAmount = '';
    let firstPart = '';
    let remainingPart = '';
    
    // Extract last 3 digits
    firstPart = numStr.substring(numStr.length - 3);
    remainingPart = numStr.substring(0, numStr.length - 3);
    
    // Add commas after every 2 digits from right to left
    if (remainingPart.length > 0) {
      formattedAmount = firstPart;
      
      // Process remaining digits in groups of 2
      let i = remainingPart.length;
      while (i > 0) {
        const digits = i >= 2 ? remainingPart.substring(i - 2, i) : remainingPart.substring(0, i);
        formattedAmount = digits + ',' + formattedAmount;
        i -= 2;
      }
      
      // Remove leading comma if it exists
      if (formattedAmount.startsWith(',')) {
        formattedAmount = formattedAmount.substring(1);
      }
    } else {
      formattedAmount = firstPart;
    }
    
    return '₹' + formattedAmount;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#4CAF50';
      case 'ACTIVE':
        return '#2196F3';
      case 'OVERDUE':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  // Get payment type label
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'EARLY':
        return 'Paid Early';
      case 'LATE':
        return 'Late Payment';
      case 'REGULAR':
        return 'Regular Payment';
      default:
        return 'Payment';
    }
  };

  // Get payment type icon
  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'EARLY':
        return 'flash';
      case 'LATE':
        return 'alert-circle';
      case 'REGULAR':
        return 'checkmark-circle';
      default:
        return 'cash';
    }
  };

  // Get payment type color
  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'EARLY':
        return '#4CAF50';
      case 'LATE':
        return '#F44336';
      case 'REGULAR':
        return '#2196F3';
      default:
        return '#2196F3';
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Borrowing Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Loan Summary Card */}
        <View style={styles.loanSummaryContainer}>
          <LinearGradient
            colors={['rgba(76, 175, 80, 0.15)', 'rgba(76, 175, 80, 0.05)']}
            style={styles.loanSummaryGradient}
          >
            <View style={styles.loanHeader}>
              <View style={[styles.loanStatus, { backgroundColor: `${getStatusColor(loanDetails.status)}20` }]}>
                <Ionicons name={loanDetails.status === 'PAID' ? 'checkmark-circle' : 'time'} size={16} color={getStatusColor(loanDetails.status)} />
                <Text style={[styles.loanStatusText, { color: getStatusColor(loanDetails.status) }]}>{loanDetails.status}</Text>
              </View>
              <Text style={styles.loanId}>ID: {loanDetails.id}</Text>
            </View>
            
            <Text style={styles.loanAmount}>{formatAmount(loanDetails.amount)}</Text>
            <Text style={styles.loanTerms}>{loanDetails.term} • {loanDetails.interestRate} p.a.</Text>
            
            <View style={styles.loanDateContainer}>
              <View style={styles.loanDateItem}>
                <Text style={styles.loanDateLabel}>Start Date</Text>
                <Text style={styles.loanDateValue}>{loanDetails.startDate}</Text>
              </View>
              <View style={styles.loanDateDivider} />
              <View style={styles.loanDateItem}>
                <Text style={styles.loanDateLabel}>End Date</Text>
                <Text style={styles.loanDateValue}>{loanDetails.endDate}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Loan Stats */}
        <View style={styles.loanStatsContainer}>
          <View style={styles.loanStatItem}>
            <Text style={styles.loanStatLabel}>Principal</Text>
            <Text style={styles.loanStatValue}>{formatAmount(loanDetails.amount)}</Text>
          </View>
          <View style={styles.loanStatItem}>
            <Text style={styles.loanStatLabel}>Interest</Text>
            <Text style={styles.loanStatValue}>{formatAmount(loanDetails.interest)}</Text>
          </View>
          <View style={styles.loanStatItem}>
            <Text style={styles.loanStatLabel}>Total Paid</Text>
            <Text style={[styles.loanStatValue, styles.loanStatTotal]}>{formatAmount(loanDetails.totalPaid)}</Text>
          </View>
        </View>
        
        {/* Payment History */}
        <Text style={styles.sectionTitle}>Payment History</Text>
        
        <View style={styles.paymentHistoryContainer}>
          {loanDetails.payments.map((payment, index) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentLeft}>
                <View style={[styles.paymentIconContainer, { backgroundColor: `${getPaymentTypeColor(payment.type)}20` }]}>
                  <Ionicons name={getPaymentTypeIcon(payment.type)} size={16} color={getPaymentTypeColor(payment.type)} />
                </View>
                <View>
                  <Text style={styles.paymentType}>{getPaymentTypeLabel(payment.type)}</Text>
                  <Text style={styles.paymentDate}>{payment.date}</Text>
                </View>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                {payment.type === 'EARLY' && (
                  <Text style={styles.paymentSavings}>Saved ₹75</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        
        {/* Certificate Button (only for paid loans) */}
        {loanDetails.status === 'PAID' && (
          <TouchableOpacity style={styles.certificateButton}>
            <Ionicons name="document-text" size={16} color="#ffffff" style={styles.certificateIcon} />
            <Text style={styles.certificateText}>Download Closure Certificate</Text>
          </TouchableOpacity>
        )}
        
        {/* Bottom spacer for scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: StatusBar.currentHeight || 40,
    zIndex: 10,
    marginTop: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loanSummaryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loanSummaryGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  loanStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  loanId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loanAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  loanTerms: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  loanDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    padding: 12,
  },
  loanDateItem: {
    flex: 1,
    alignItems: 'center',
  },
  loanDateLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  loanDateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  loanDateDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  loanStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  loanStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loanStatTotal: {
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  paymentHistoryContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  paymentSavings: {
    fontSize: 10,
    color: '#4CAF50',
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  certificateIcon: {
    marginRight: 8,
  },
  certificateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80,
  },
});

export default ViewDetails;
