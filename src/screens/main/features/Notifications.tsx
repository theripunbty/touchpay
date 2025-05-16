import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../../types/navigation';

// Define types for our data
type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  icon: string;
  iconColor: string;
  type: 'payment' | 'offer' | 'security' | 'reminder';
};

type NotificationsProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const Notifications: React.FC<NotificationsProps> = ({ navigation }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'personal' | 'offers'>('personal');
  
  // Sample data for personal notifications
  const personalNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Money received',
      description: 'You received ₹500 from Ripun Basumatary',
      time: '2 hours ago',
      isNew: true,
      icon: 'account-arrow-left',
      iconColor: '#00D09C',
      type: 'payment',
    },
    {
      id: '2',
      title: 'Payment successful',
      description: 'Your payment of ₹1,200 to Electricity Board was successful',
      time: '5 hours ago',
      isNew: true,
      icon: 'check-circle',
      iconColor: '#00D09C',
      type: 'payment',
    },
    {
      id: '3',
      title: 'UPI AutoPay reminder',
      description: 'Your Netflix subscription (₹499) will be auto-debited tomorrow',
      time: 'Yesterday',
      isNew: false,
      icon: 'calendar-clock',
      iconColor: '#FFA500',
      type: 'reminder',
    },
    {
      id: '4',
      title: 'Security alert',
      description: 'New device logged into your TouchPay account',
      time: '2 days ago',
      isNew: false,
      icon: 'shield-alert',
      iconColor: '#FF6B6B',
      type: 'security',
    },
  ];

  // Sample data for offers notifications
  const offerNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Cashback offer',
      description: 'Get 5% cashback on your first 3 bill payments this month',
      time: 'Today',
      isNew: true,
      icon: 'percent',
      iconColor: '#00D09C',
      type: 'offer',
    },
    {
      id: '2',
      title: 'Reward points',
      description: 'You earned 200 reward points on your last transaction',
      time: '1 day ago',
      isNew: false,
      icon: 'gift',
      iconColor: '#FFA500',
      type: 'offer',
    },
    {
      id: '3',
      title: 'Limited time offer',
      description: 'Send money to 5 friends and get ₹50 cashback',
      time: '3 days ago',
      isNew: false,
      icon: 'clock-fast',
      iconColor: '#00D09C',
      type: 'offer',
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (item: NotificationItem) => {
    navigation.navigate('NotificationDetail', item);
  };

  // Render notification item
  const renderNotificationItem = (item: NotificationItem) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.notificationItem}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}10` }]}>
          <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {item.isNew && <View style={styles.newBadge} />}
          </View>
          <Text style={styles.notificationDescription}>{item.description}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
            onPress={() => setActiveTab('personal')}
          >
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>Offers & Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Notification List */}
        <View style={styles.notificationsContainer}>
          {activeTab === 'personal' ? (
            personalNotifications.length > 0 ? (
              personalNotifications.map(item => renderNotificationItem(item))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-off-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No notifications yet</Text>
              </View>
            )
          ) : (
            offerNotifications.length > 0 ? (
              offerNotifications.map(item => renderNotificationItem(item))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="tag-off-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No offers available</Text>
              </View>
            )
          )}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBorder} />
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Mark all as read</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>{'•'}</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Notification settings</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 5,
    marginBottom: 8,
  },
  backButton: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: '#00D09C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e8e',
  },
  activeTabText: {
    color: '#ffffff',
  },
  notificationsContainer: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  newBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D09C',
  },
  notificationDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 20,
    marginTop: 20,
  },
  footerBorder: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  footerLink: {
    color: '#00D09C',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  footerSeparator: {
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 4,
  },
});

export default Notifications;