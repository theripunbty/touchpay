import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../../types/navigation';

type NotificationDetailProps = NativeStackScreenProps<RootStackParamList, 'NotificationDetail'>;

const NotificationDetail: React.FC<NotificationDetailProps> = ({ route, navigation }) => {
  const { id, title, description, time, icon, iconColor, type } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Render different content based on notification type
  const renderDetailContent = () => {
    switch (type) {
      case 'payment':
        return (
          <View style={styles.detailContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Transaction Details</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction ID</Text>
                <Text style={styles.infoValue}>UPI123456789</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: '#00D09C' }]} />
                  <Text style={[styles.statusText, { color: '#00D09C' }]}>Successful</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>₹500.00</Text>
              </View>
            </View>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Payment Method</Text>
              </View>
              
              <View style={styles.paymentMethod}>
                <View style={[styles.iconBg, { backgroundColor: 'rgba(0, 208, 156, 0.1)' }]}>
                  <MaterialCommunityIcons name="bank" size={20} color="#00D09C" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>HDFC Bank</Text>
                  <Text style={styles.paymentSubtitle}>XXXX XXXX 1234</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="share-variant" size={18} color="#fff" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="help-circle-outline" size={18} color="#fff" />
                <Text style={styles.actionText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'offer':
        return (
          <View style={styles.detailContent}>
            <View style={styles.card}>
              <View style={styles.offerImageContainer}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/350x150' }} 
                  style={styles.offerImage}
                  resizeMode="cover"
                />
              </View>
              
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>5% Cashback Offer</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Get 5% cashback on your first 3 bill payments this month. Maximum cashback of ₹100 per transaction.
              </Text>
              
              <View style={styles.offerDetails}>
                <View style={styles.offerDetailItem}>
                  <MaterialCommunityIcons name="calendar-range" size={16} color="#00D09C" />
                  <Text style={styles.offerDetailText}>Valid till: 30 June 2023</Text>
                </View>
                
                <View style={styles.offerDetailItem}>
                  <MaterialCommunityIcons name="information-outline" size={16} color="#00D09C" />
                  <Text style={styles.offerDetailText}>Min. transaction: ₹200</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Terms & Conditions</Text>
              </View>
              
              <Text style={styles.termsText}>
                • Offer valid on bill payments only{'\n'}
                • Maximum cashback of ₹100 per transaction{'\n'}
                • Cashback will be credited within 24 hours{'\n'}
                • Offer valid for selected users only
              </Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Claim Now</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'security':
        return (
          <View style={styles.detailContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Security Alert</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                We detected a new login to your TouchPay account from a new device. If this was you, no action is needed.
              </Text>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Device</Text>
                <Text style={styles.infoValue}>iPhone 13</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>Mumbai, India</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>IP Address</Text>
                <Text style={styles.infoValue}>192.168.1.XX</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>This Was Me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.actionText}>Secure Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'reminder':
        return (
          <View style={styles.detailContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Upcoming AutoPay</Text>
              </View>
              
              <Text style={styles.cardDescription}>
                Your Netflix subscription will be auto-debited tomorrow. Please ensure you have sufficient balance.
              </Text>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Merchant</Text>
                <Text style={styles.infoValue}>Netflix</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount</Text>
                <Text style={styles.infoValue}>₹499</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>Tomorrow</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>HDFC Bank - XXXX1234</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="credit-card-edit-outline" size={18} color="#fff" />
                <Text style={styles.actionText}>Change Method</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(255, 107, 107, 0.8)' }]}>
                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#fff" />
                <Text style={styles.actionText}>Cancel AutoPay</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={styles.defaultText}>Notification details not available</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notification Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
          </View>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        
        {/* Notification Description */}
        <Text style={styles.descriptionText}>{description}</Text>
        
        {/* Notification Details */}
        {renderDetailContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  detailContent: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 8,
  },
  offerImageContainer: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: 120,
  },
  offerDetails: {
    marginTop: 8,
  },
  offerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerDetailText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  primaryButton: {
    backgroundColor: '#00D09C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#121212',
  },
  defaultContent: {
    padding: 20,
    alignItems: 'center',
  },
  defaultText: {
    color: '#8e8e8e',
    fontSize: 15,
  },
});

export default NotificationDetail; 