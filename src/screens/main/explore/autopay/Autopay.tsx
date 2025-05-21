import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
  Platform,
  Alert,
  SafeAreaView,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  Home: undefined;
  Autopay: undefined;
  Billings: undefined;
};

type AutopayNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Autopay'>;

// Minimal empty state component
const EmptyState = () => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <MCIcon 
          name="bird" 
          size={60} 
          color="#6200EE" 
        />
      </View>
    </View>
  );
};

// Autopay item component
const AutopayItem = ({ 
  title, 
  amount, 
  dueDate, 
  iconName 
}: { 
  title: string; 
  amount: string; 
  dueDate: string; 
  iconName: string;
}) => (
  <View style={styles.autopayItem}>
    <View style={styles.autopayItemIcon}>
      <MCIcon name={iconName} size={30} color="#6200EE" />
    </View>
    <View style={styles.autopayItemContent}>
      <Text style={styles.autopayItemTitle}>{title}</Text>
      <Text style={styles.autopayItemDueDate}>Next payment: {dueDate}</Text>
    </View>
    <View style={styles.autopayItemAmount}>
      <Text style={styles.autopayItemAmountText}>₹{amount}</Text>
    </View>
  </View>
);

const Autopay: React.FC = () => {
  const navigation = useNavigation<AutopayNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [hasAutopay] = useState(false); // Change to true to show autopay items
  
  // Sample autopay data
  const autopayItems = [
    { id: '1', title: 'Electricity Bill', amount: '1,250', dueDate: '15 Jun', iconName: 'flash' },
    { id: '2', title: 'Mobile Recharge', amount: '599', dueDate: '22 Jun', iconName: 'cellphone' },
    { id: '3', title: 'Internet Bill', amount: '999', dueDate: '28 Jun', iconName: 'wifi' },
  ];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const navigateToBillings = () => {
    navigation.navigate('Billings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autopay</Text>
      </View>

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.title}>Never miss a payment</Text>
        
        <Text style={styles.description}>
          Set up automatic payments for your recurring bills and subscriptions
        </Text>

        {hasAutopay ? (
          <FlatList
            data={autopayItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AutopayItem
                title={item.title}
                amount={item.amount}
                dueDate={item.dueDate}
                iconName={item.iconName}
              />
            )}
            contentContainerStyle={styles.autopayList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState />
        )}

        <TouchableOpacity 
          style={styles.setupButton}
          onPress={navigateToBillings}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.setupButtonText}>Setup Autopay</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autopayList: {
    paddingTop: 10,
    paddingBottom: 80,
  },
  autopayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  autopayItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  autopayItemContent: {
    flex: 1,
  },
  autopayItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  autopayItemDueDate: {
    fontSize: 14,
    color: '#666666',
  },
  autopayItemAmount: {
    alignItems: 'flex-end',
  },
  autopayItemAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  setupButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#6200EE',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Autopay;
