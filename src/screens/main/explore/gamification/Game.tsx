import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface GameProps {
  navigation: any;
}

const Game: React.FC<GameProps> = ({ navigation }) => {
  const [showRules, setShowRules] = useState(false);
  const [showCashbackHistory, setShowCashbackHistory] = useState(false);
  
  const [snows, setSnows] = useState<Fire[]>([
    {
      id: '1',
      amount: 30,
      recipient: 'Samir paul',
      days: 7,
      color: 'green',
    },
    {
      id: '2',
      amount: 70,
      recipient: 'Sharmass',
      days: 7,
      color: 'gold',
    },
  ]);
  
  // Sample cashback history data
  const [cashbackHistory, setCashbackHistory] = useState<Cashback[]>([
    {
      id: '1',
      amount: 15,
      date: '12 Jun 2023',
      transactionId: 'TX789012345',
    },
    {
      id: '2',
      amount: 24,
      date: '8 Jun 2023',
      transactionId: 'TX456789012',
    },
    {
      id: '3',
      amount: 10,
      date: '2 Jun 2023',
      transactionId: 'TX123456789',
    },
  ]);

  const gameRules = [
    "Get up to 8 rushes per day by making UPI payments",
    "Each rush gives you a chance to win cashback up to ₹100",
    "Minimum transaction amount: ₹50",
    "Your rush expires after 7 days if not claimed",
  ];

  const ruleIcons = [
    "flash-on",
    "payments",
    "account-balance",
    "event-available"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Game Rules Modal - Redesigned */}
      <Modal
        visible={showRules}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRules(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.rulesModalOverlay}>
          <View style={styles.rulesModalContainer}>
            <View style={styles.rulesHeader}>
              <Text style={styles.rulesTitle}>Winter Rush Tips</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowRules(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.rulesContent}>
              {gameRules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <View style={styles.ruleIconContainer}>
                    <MaterialIcons name={ruleIcons[index]} size={20} color="#FFF" />
                  </View>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.gotItButton}
              onPress={() => setShowRules(false)}
            >
              <Text style={styles.gotItText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Cashback History Modal - Redesigned */}
      <Modal
        visible={showCashbackHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCashbackHistory(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cashback History</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCashbackHistory(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {cashbackHistory.length > 0 ? (
              <FlatList
                data={cashbackHistory}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.cashbackItem}>
                    <View style={styles.cashbackIconContainer}>
                      <MaterialIcons name="payments" size={20} color="#FFA000" />
                    </View>
                    <View style={styles.cashbackDetails}>
                      <Text style={styles.cashbackAmount}>₹{item.amount} Cashback</Text>
                      <Text style={styles.cashbackDate}>{item.date}</Text>
                      <Text style={styles.cashbackTransactionId}>{item.transactionId}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.cashbackList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <MaterialIcons name="history" size={48} color="#EEEEEE" />
                <Text style={styles.emptyListText}>No cashback history yet</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="chevron-left" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>winter rush</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowRules(!showRules)}
          >
            <MaterialIcons name="lightbulb-outline" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Leader Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setShowCashbackHistory(true)}
        >
          <LinearGradient
            colors={['#E91E63', '#FF5252']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.leaderCard}
          >
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderLabel}>Lifetime cashback</Text>
              <Text style={styles.leaderName}>₹ 400</Text>
              
              <View style={styles.winterStormContainer}>
                <Text style={styles.winterStormText}>Winter Rush Records</Text>
                <MaterialIcons name="arrow-drop-up" size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.profileContainer}>
              <Image 
                source={{ uri: 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1746203887/oliveit/registrations/yuae5vufae2k8uwrtoit.jpg' }}
                style={styles.profileImage} 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* snows Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All rushes ({snows.length})</Text>
          
          {snows.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image 
                source={{ uri: 'https://i.imgur.com/nVJFoI0.png' }}
                style={styles.emptyStateImage} 
              />
              <Text style={styles.emptyStateText}>
                Play and win cashback when you pay with touchpay UPI
              </Text>
            </View>
          ) : (
            <View style={styles.fireGrid}>
              {snows.map(fire => (
                <TouchableOpacity 
                  key={fire.id} 
                  activeOpacity={0.9}
                  style={styles.fireCardWrapper}
                >
                  <LinearGradient
                    colors={fire.color === 'green' ? ['#4CAF50', '#2E7D32'] : ['#FFC107', '#FF9800']}
                    style={styles.fireCard}
                  >
                    <Text style={styles.fireAmount}>₹{fire.amount} paid to</Text>
                    <Text style={styles.fireRecipient}>{fire.recipient}</Text>
                    <View style={styles.fireDaysContainer}>
                      <MaterialIcons name="schedule" size={16} color="#FFFFFF" />
                      <Text style={styles.fireDays}>{fire.days} days</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface Fire {
  id: string;
  amount: number;
  recipient: string;
  days: number;
  color: 'green' | 'gold';
}

interface Cashback {
  id: string;
  amount: number;
  date: string;
  transactionId: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 20,
    padding: 4,
  },
  leaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  leaderName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fireEmoji: {
    fontSize: 24,
  },
  leaderAmount: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
  },
  profileContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyStateImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666666',
    lineHeight: 26,
  },
  fireGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  fireCardWrapper: {
    width: '50%',
    padding: 8,
  },
  fireCard: {
    borderRadius: 20,
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  fireAmount: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fireRecipient: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  fireDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fireDays: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 14,
  },
  // Redesigned Rules Modal Styles
  rulesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesModalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: height * 0.5,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E91E63',
  },
  ruleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ruleText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
    lineHeight: 20,
  },
  gotItButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 14,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Redesigned Cashback Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackList: {
    padding: 16,
  },
  cashbackItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
  },
  cashbackIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF8E1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cashbackDetails: {
    flex: 1,
  },
  cashbackAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cashbackDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cashbackTransactionId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyListContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  winterStormContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  winterStormText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Game;
