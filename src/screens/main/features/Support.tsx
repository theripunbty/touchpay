import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SupportScreenNavigationProp } from '../../../types/navigation';

// FAQ Item Component
interface FAQItemProps {
  title: string;
  content: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ title, content }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.faqItemContainer}>
      <TouchableOpacity 
        style={styles.faqItem} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name={expanded ? "checkbox-blank-circle" : "checkbox-blank-circle-outline"} size={20} color="#00D09C" />
        <Text style={styles.faqText}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Icon name="keyboard-arrow-down" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqContent}>
          <Text style={styles.faqContentText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const Support: React.FC = () => {
  const navigation = useNavigation<SupportScreenNavigationProp>();
  
  const handleBackPress = () => {
    // Handle navigation back
    navigation.goBack();
  };

  const navigateToLiveSupport = () => {
    navigation.navigate('LiveSupport');
  };

  // FAQ data
  const faqData = [
    {
      title: "How to add money to TouchPay wallet?",
      content: "You can add money to your TouchPay wallet using UPI, debit card, credit card, or net banking. Go to the Home screen, tap on 'Add Money', enter the amount, and select your preferred payment method."
    },
    {
      title: "How to send money to contacts?",
      content: "To send money, go to the Home screen and tap on 'Pay'. Enter the recipient's phone number or select from your contacts. Enter the amount, add a note (optional), and tap 'Pay'. Verify with your UPI PIN to complete the transaction."
    },
    {
      title: "Is my money safe with TouchPay?",
      content: "Yes, TouchPay uses bank-level encryption to secure all transactions. We also have multiple layers of security including PIN, fingerprint, and face recognition to protect your account."
    },
    {
      title: "How to check transaction history?",
      content: "To view your transaction history, go to the Home screen and tap on 'History'. You can filter transactions by date, type, or status. You can also download transaction statements for specific periods."
    },
    {
      title: "What if a payment fails but money is debited?",
      content: "If your payment fails but the money is debited from your account, it will be automatically refunded within 5-7 business days. If you don't receive the refund, please contact our customer support with your transaction ID."
    }
  ];

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
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>TouchPay Support</Text>

        {/* Contact Section */}
        <View style={styles.contactSection}>          
          <Text style={styles.contactTitle}>Contact us 24/7</Text>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={navigateToLiveSupport}
          >
            <MaterialCommunityIcons name="message-text-outline" size={24} color="#00D09C" />
            <View style={styles.chatContactInfo}>
              <Text style={styles.contactLabel}>Chat with us</Text>
              <Text style={styles.contactSubLabel}>Get an instant reply</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactHalfCard}>
              <View style={styles.iconContainer}>
                <Icon name="call" size={22} color="#00D09C" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Call us</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactHalfCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#00D09C" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email us</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>FAQs</Text>
          
          {faqData.map((faq, index) => (
            <FAQItem 
              key={index} 
              title={faq.title} 
              content={faq.content} 
            />
          ))}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBorder} />
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Past queries</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>{'•'}</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Feedback</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>{'•'}</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Grievance</Text>
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
  searchButton: {
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 20,
    marginBottom: 32,
    marginTop: 8,
  },
  contactSection: {
    padding: 20,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  contactHalfCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 208, 156, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  contactInfo: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 12,
  },
  contactLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  contactSubLabel: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    color: '#00D09C',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  faqSection: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  faqItemContainer: {
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    backgroundColor: '#1A1A1A',
  },
  faqContentText: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 32,
  },
  chatContactInfo: {
    marginLeft: 12,
    flex: 1,
    alignItems: 'flex-start',
  },
  footer: {
    padding: 20,
    paddingTop: 20,
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

export default Support;