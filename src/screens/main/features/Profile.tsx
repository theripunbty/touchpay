import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import type { ProfileScreenNavigationProp } from "../../../types/navigation"


interface Props {
    navigation: ProfileScreenNavigationProp
  }

const { width, height } = Dimensions.get('window');

interface MenuItem {
  icon: string;
  label: string;
  badge?: string;
  status?: string;
  value?: string;
  onPress?: () => void;
  isPremium?: boolean;
}

interface Section {
  title: string;
  items: MenuItem[];
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const profileSections: Section[] = [
    {
      title: 'Premium',
      items: [
        { 
          icon: 'verified', 
          label: 'Premium Membership',
        //   onPress: () => navigation.navigate('Membership')
        }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: 'account-balance', label: 'Bank Account & Cards', badge: '3' },
        { icon: 'payments', label: 'Redeem Cashback' },
        { icon: 'account-balance-wallet', label: 'Add Money to Wallet' },
        { icon: 'verified-user', label: 'KYC Verification', status: 'Verified' },
        { icon: 'security', label: 'Privacy & Security' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-none', label: 'Notifications' },
        { icon: 'language', label: 'Language', value: 'English' },
        { icon: 'dark-mode', label: 'Theme', value: 'Dark' },
      ]
    },
    {
      title: 'Help & Support',
      items: [
        { icon: 'help-outline', label: 'FAQs' },
        { icon: 'support-agent', label: '24/7 Support' },
        { icon: 'description', label: 'Terms & Privacy' },
      ]
    }
  ];

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1746203887/oliveit/registrations/yuae5vufae2k8uwrtoit.jpg' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialIcons name="verified" size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
            {/* <View style={styles.badgesContainer}>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="verified" size={16} color="#FFD700" />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            </View> */}
            <Text style={styles.name}>Ripun Basumatary</Text>
            <Text style={styles.email}>ripunbasumatary10@gmail.com</Text>
            <View style={styles.upiContainer}>
              {/* <MaterialIcons name="verified" size={16} color="#4CAF50" /> */}
              <Text style={styles.upiId}>7002670531@tpaxis</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹85,500</Text>
                  <Text style={styles.statLabel}>Wallet Balance</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹2,000</Text>
                  <Text style={styles.statLabel}>Lifetime Cashback</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {profileSections.map((section, index) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <MaterialIcons 
                      name={item.icon} 
                      size={24} 
                      color="#fff"
                    />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    {item.status && (
                      <Text style={[styles.statusText, { color: item.status === 'Verified' ? '#4CAF50' : '#fff' }]}>
                        {item.status}
                      </Text>
                    )}
                    {item.value && (
                      <Text style={styles.valueText}>{item.value}</Text>
                    )}
                    <MaterialIcons 
                      name="chevron-right" 
                      size={24} 
                      color="rgba(255,255,255,0.3)"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    height: height * 0.08,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
  editButton: {
    width: width * 0.1,
    height: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: height * 0.02,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: height * 0.03,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: height * 0.03,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: height * 0.02,
  },
  avatar: {
    width: width * 0.30,
    height: width * 0.30,
    borderRadius: width * 0.200,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.21)',
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  name: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
    marginBottom: height * 0.005,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.003,
    borderRadius: width * 0.01,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.003,
    borderRadius: width * 0.01,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: width * 0.03,
    fontWeight: '500',
    marginLeft: width * 0.01,
  },
  email: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: width * 0.035,
    marginBottom: height * 0.01,
  },
  upiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.01,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: width * 0.02,
  },
  upiId: {
    color: '#fff',
    fontSize: width * 0.035,
  },
  statsContainer: {
    marginHorizontal: width * 0.04,
    marginBottom: height * 0.03,
    borderRadius: width * 0.03,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  statsGradient: {
    padding: width * 0.04,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: height * 0.04,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: width * 0.04,
  },
  statValue: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: width * 0.035,
  },
  section: {
    marginBottom: height * 0.03,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: width * 0.03,
    overflow: 'hidden',
    marginHorizontal: width * 0.04,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: width * 0.035,
    fontWeight: '500',
    marginLeft: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.003,
    borderRadius: width * 0.01,
    minWidth: width * 0.05,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: width * 0.03,
    fontWeight: '600',
  },
  statusText: {
    fontSize: width * 0.035,
    fontWeight: '500',
  },
  valueText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: width * 0.035,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.02,
    paddingVertical: height * 0.02,
    marginBottom: height * 0.05,
    backgroundColor: '#98144D',
    marginHorizontal: width * 0.04,
    borderRadius: width * 0.03,
  },
  logoutText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
});

export default ProfileScreen; 