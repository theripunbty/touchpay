import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import GridBackground from '@components/GridBackground';

const { width, height } = Dimensions.get('window');

// Mock data for spending
const mockSpendingData = {
  today: {
    amount: '1,880.00',
    comparison: {
      amount: '180.00',
      percentage: 12,
      trend: 'up'
    },
    categories: [
      { name: 'Food & Dining', amount: 820, color: '#FF6B6B' },
      { name: 'Shopping', amount: 450, color: '#4ECDC4' },
      { name: 'Transportation', amount: 320, color: '#FFD166' },
      { name: 'Entertainment', amount: 180, color: '#118AB2' },
      { name: 'Others', amount: 110, color: '#073B4C' },
    ],
    hourly: [
      { hour: '12 AM', amount: 0 },
      { hour: '4 AM', amount: 0 },
      { hour: '8 AM', amount: 320 },
      { hour: '12 PM', amount: 580 },
      { hour: '4 PM', amount: 780 },
      { hour: '8 PM', amount: 1880 },
    ]
  },
  yesterday: {
    amount: '183.20',
    comparison: {
      amount: '163.45',
      percentage: 8,
      trend: 'down'
    },
    categories: [
      { name: 'Food & Dining', amount: 73, color: '#FF6B6B' },
      { name: 'Shopping', amount: 20, color: '#4ECDC4' },
      { name: 'Transportation', amount: 50, color: '#FFD166' },
      { name: 'Entertainment', amount: 0, color: '#118AB2' },
      { name: 'Others', amount: 40.20, color: '#073B4C' },
    ],
    hourly: [
      { hour: '12 AM', amount: 0 },
      { hour: '4 AM', amount: 0 },
      { hour: '8 AM', amount: 23 },
      { hour: '12 PM', amount: 73 },
      { hour: '4 PM', amount: 143 },
      { hour: '8 PM', amount: 183 },
    ]
  },
  week: {
    amount: '6,324.50',
    comparison: {
      amount: '450.80',
      percentage: 7,
      trend: 'up'
    },
    categories: [
      { name: 'Food & Dining', amount: 2100, color: '#FF6B6B' },
      { name: 'Shopping', amount: 1450, color: '#4ECDC4' },
      { name: 'Transportation', amount: 820, color: '#FFD166' },
      { name: 'Entertainment', amount: 980, color: '#118AB2' },
      { name: 'Others', amount: 974.50, color: '#073B4C' },
    ],
    daily: [
      { day: 'Mon', amount: 950 },
      { day: 'Tue', amount: 1230 },
      { day: 'Wed', amount: 820 },
      { day: 'Thu', amount: 1100 },
      { day: 'Fri', amount: 1880 },
      { day: 'Sat', amount: 344.50 },
      { day: 'Sun', amount: 0 },
    ]
  },
  month: {
    amount: '24,568.20',
    comparison: {
      amount: '1,245.60',
      percentage: 5,
      trend: 'up'
    },
    categories: [
      { name: 'Food & Dining', amount: 8240, color: '#FF6B6B' },
      { name: 'Shopping', amount: 6450, color: '#4ECDC4' },
      { name: 'Transportation', amount: 3200, color: '#FFD166' },
      { name: 'Entertainment', amount: 2800, color: '#118AB2' },
      { name: 'Others', amount: 3878.20, color: '#073B4C' },
    ],
    weekly: [
      { week: 'Week 1', amount: 5840 },
      { week: 'Week 2', amount: 6324 },
      { week: 'Week 3', amount: 7820 },
      { week: 'Week 4', amount: 4584.20 },
    ]
  }
};

type TimeFilter = 'today' | 'yesterday' | 'week' | 'month';

const TotalSpents: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'timeline'>('overview');
  const [animatedValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const fadeInTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  const renderBarChart = () => {
    // Different chart data based on time filter
    let data = {
      labels: [] as string[],
      datasets: [{ data: [] as number[] }],
    };

    if (timeFilter === 'today' || timeFilter === 'yesterday') {
      data = {
        labels: mockSpendingData[timeFilter].hourly.map(item => item.hour) as string[],
        datasets: [
          {
            data: mockSpendingData[timeFilter].hourly.map(item => item.amount) as number[],
          },
        ],
      };
    } else if (timeFilter === 'week') {
      data = {
        labels: mockSpendingData.week.daily.map(item => item.day) as string[],
        datasets: [
          {
            data: mockSpendingData.week.daily.map(item => item.amount) as number[],
          },
        ],
      };
    } else if (timeFilter === 'month') {
      data = {
        labels: mockSpendingData.month.weekly.map(item => item.week) as string[],
        datasets: [
          {
            data: mockSpendingData.month.weekly.map(item => item.amount) as number[],
          },
        ],
      };
    }

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={width * 0.9}
          height={height * 0.25}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'rgba(0, 0, 0, 0.1)',
            backgroundGradientTo: 'rgba(0, 0, 0, 0.1)',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.6,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showValuesOnTopOfBars={true}
        />
      </View>
    );
  };

  const renderLineChart = () => {
    // Different chart data based on time filter
    let data = {
      labels: [] as string[],
      datasets: [{ 
        data: [] as number[],
        color: () => 'rgba(75, 192, 192, 1)', 
      }],
    };

    if (timeFilter === 'today' || timeFilter === 'yesterday') {
      data = {
        labels: mockSpendingData[timeFilter].hourly.map(item => item.hour) as string[],
        datasets: [
          {
            data: mockSpendingData[timeFilter].hourly.map(item => item.amount) as number[],
            color: () => 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    } else if (timeFilter === 'week') {
      data = {
        labels: mockSpendingData.week.daily.map(item => item.day) as string[],
        datasets: [
          {
            data: mockSpendingData.week.daily.map(item => item.amount) as number[],
            color: () => 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    } else if (timeFilter === 'month') {
      data = {
        labels: mockSpendingData.month.weekly.map(item => item.week) as string[],
        datasets: [
          {
            data: mockSpendingData.month.weekly.map(item => item.amount) as number[],
            color: () => 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={width * 0.9}
          height={height * 0.25}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'rgba(0, 0, 0, 0.1)',
            backgroundGradientTo: 'rgba(0, 0, 0, 0.1)',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#4ECDC4"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    const categories = mockSpendingData[timeFilter].categories;
    const total = parseFloat(mockSpendingData[timeFilter].amount.replace(',', ''));

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        
        {categories.map((category, index) => {
          const percentage = Math.round((category.amount / total) * 100);
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryNameContainer}>
                  <View 
                    style={[styles.categoryColor, { backgroundColor: category.color }]} 
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <Text style={styles.categoryAmount}>₹ {category.amount.toFixed(2)}</Text>
                  <Text style={styles.categoryPercentage}>{percentage}%</Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: category.color
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOverviewTab = () => {
    return (
      <Animated.View 
        style={[
          styles.tabContent,
          { opacity, transform: [{ translateY: fadeInTranslateY }] }
        ]}
      >
        <View style={styles.spendingSummary}>
          <Text style={styles.spendingTitle}>Total Spent</Text>
          <Text style={styles.spendingAmount}>₹ {mockSpendingData[timeFilter].amount}</Text>
          
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonText}>
              {mockSpendingData[timeFilter].comparison.trend === 'up' ? '↑' : '↓'} ₹ {mockSpendingData[timeFilter].comparison.amount}
            </Text>
            <View 
              style={[
                styles.percentageTag,
                mockSpendingData[timeFilter].comparison.trend === 'up' 
                  ? styles.percentageTagUp 
                  : styles.percentageTagDown
              ]}
            >
              <Text 
                style={[
                  styles.percentageText,
                  mockSpendingData[timeFilter].comparison.trend === 'up' 
                    ? styles.percentageTextUp 
                    : styles.percentageTextDown
                ]}
              >
                {mockSpendingData[timeFilter].comparison.percentage}%
              </Text>
            </View>
            <Text style={styles.comparisonPeriod}>
              {timeFilter === 'today' ? 'vs Yesterday' : 
               timeFilter === 'yesterday' ? 'vs Day Before' :
               timeFilter === 'week' ? 'vs Last Week' : 'vs Last Month'}
            </Text>
          </View>
        </View>
        
        {renderBarChart()}
        {renderCategoryBreakdown()}
      </Animated.View>
    );
  };

  const renderCategoriesTab = () => {
    return (
      <Animated.View 
        style={[
          styles.tabContent,
          { opacity, transform: [{ translateY: fadeInTranslateY }] }
        ]}
      >
        <View style={styles.spendingSummary}>
          <Text style={styles.spendingTitle}>Category Breakdown</Text>
          <Text style={styles.spendingAmount}>₹ {mockSpendingData[timeFilter].amount}</Text>
        </View>
        
        {renderCategoryBreakdown()}
      </Animated.View>
    );
  };

  const renderTimelineTab = () => {
    return (
      <Animated.View 
        style={[
          styles.tabContent,
          { opacity, transform: [{ translateY: fadeInTranslateY }] }
        ]}
      >
        <View style={styles.spendingSummary}>
          <Text style={styles.spendingTitle}>Spending Timeline</Text>
          <Text style={styles.spendingAmount}>₹ {mockSpendingData[timeFilter].amount}</Text>
        </View>
        
        {renderLineChart()}
      </Animated.View>
    );
  };

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
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spending Analytics</Text>
          <TouchableOpacity style={styles.optionsButton} onPress={() => navigation.navigate("Support")}>
            <MaterialIcons name="support-agent" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeFilterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeFilterScroll}
          >
            <TouchableOpacity 
              style={[
                styles.timeFilterButton,
                timeFilter === 'today' && styles.timeFilterButtonActive
              ]}
              onPress={() => handleTimeFilterChange('today')}
            >
              <Text 
                style={[
                  styles.timeFilterText,
                  timeFilter === 'today' && styles.timeFilterTextActive
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterButton,
                timeFilter === 'yesterday' && styles.timeFilterButtonActive
              ]}
              onPress={() => handleTimeFilterChange('yesterday')}
            >
              <Text 
                style={[
                  styles.timeFilterText,
                  timeFilter === 'yesterday' && styles.timeFilterTextActive
                ]}
              >
                Yesterday
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterButton,
                timeFilter === 'week' && styles.timeFilterButtonActive
              ]}
              onPress={() => handleTimeFilterChange('week')}
            >
              <Text 
                style={[
                  styles.timeFilterText,
                  timeFilter === 'week' && styles.timeFilterTextActive
                ]}
              >
                This Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterButton,
                timeFilter === 'month' && styles.timeFilterButtonActive
              ]}
              onPress={() => handleTimeFilterChange('month')}
            >
              <Text 
                style={[
                  styles.timeFilterText,
                  timeFilter === 'month' && styles.timeFilterTextActive
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'overview' && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialIcons 
              name="dashboard" 
              size={20} 
              color={activeTab === 'overview' ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.tabTextActive
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'categories' && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab('categories')}
          >
            <MaterialIcons 
              name="pie-chart" 
              size={20} 
              color={activeTab === 'categories' ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'categories' && styles.tabTextActive
              ]}
            >
              Categories
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'timeline' && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab('timeline')}
          >
            <MaterialIcons 
              name="timeline" 
              size={20} 
              color={activeTab === 'timeline' ? "#FFFFFF" : "rgba(255,255,255,0.6)"} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'timeline' && styles.tabTextActive
              ]}
            >
              Timeline
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
          
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("Transactions")}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="receipt" size={24} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Transactions</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Borrow")}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="account-balance" size={24} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Borrow</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="person" size={24} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="account-balance-wallet" size={24} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Bank Accounts</Text>
                </LinearGradient>
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
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeFilterContainer: {
    marginVertical: height * 0.02,
  },
  timeFilterScroll: {
    paddingHorizontal: width * 0.05,
    gap: width * 0.03,
    flexDirection: 'row',
  },
  timeFilterButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.05,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeFilterButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  timeFilterText: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.7)',
  },
  timeFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.05,
    gap: width * 0.01,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: width * 0.05,
  },
  spendingSummary: {
    marginBottom: height * 0.03,
  },
  spendingTitle: {
    fontSize: width * 0.04,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: height * 0.01,
    marginTop: height * 0.02,
  },
  spendingAmount: {
    fontSize: width * 0.08,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: height * 0.01,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  comparisonText: {
    fontSize: width * 0.04,
    color: 'rgba(255,255,255,0.8)',
  },
  percentageTag: {
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.002,
    borderRadius: width * 0.01,
  },
  percentageTagUp: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  percentageTagDown: {
    backgroundColor: 'rgba(244,67,54,0.2)',
  },
  percentageText: {
    fontSize: width * 0.03,
    fontWeight: '600',
  },
  percentageTextUp: {
    color: '#4CAF50',
  },
  percentageTextDown: {
    color: '#F44336',
  },
  comparisonPeriod: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.5)',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  categoriesContainer: {
    marginVertical: height * 0.02,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: height * 0.02,
  },
  categoryItem: {
    marginBottom: height * 0.02,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  categoryColor: {
    width: width * 0.03,
    height: width * 0.03,
    borderRadius: width * 0.015,
  },
  categoryName: {
    fontSize: width * 0.035,
    color: '#FFFFFF',
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryPercentage: {
    fontSize: width * 0.03,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBarContainer: {
    height: height * 0.008,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: width * 0.01,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: width * 0.01,
  },
  quickActionsContainer: {
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: height * 0.015,
  },
  quickActionButton: {
    width: width * 0.43,
    borderRadius: width * 0.04,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionGradient: {
    padding: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    gap: height * 0.01,
    height: height * 0.12,
  },
  quickActionText: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: height * 0.01,
  },
});

export default TotalSpents;
