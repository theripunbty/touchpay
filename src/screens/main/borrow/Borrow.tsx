import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  LayoutChangeEvent,
  PanResponder,
  Animated,
  Easing,
  Modal,
  FlatList,
} from 'react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BorrowScreenNavigationProp } from '../../../types/navigation';

const { width } = Dimensions.get('window');

interface Props {
  navigation: BorrowScreenNavigationProp;
}

// Duration option with interest rate
interface DurationOption {
  duration: string;
  interestRate: string;
}

const Borrow: React.FC<Props> = ({ navigation }) => {
  const maxInitialAmount = 280000; // Maximum initial eligible amount
  
  const [selectedAmount, setSelectedAmount] = useState(100); // Default amount set to minimum (100)
  const [sliderValue, setSliderValue] = useState(0); // Default slider position at minimum (0)
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>({
    duration: '28 days',
    interestRate: '8.5%'
  }); // Default duration set to 28 days
  const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
  const [hasTransferred, setHasTransferred] = useState(false); // Track if transfer was made
  const [isProcessing, setIsProcessing] = useState(false); // Track processing state
  const [eligibleAmount, setEligibleAmount] = useState(maxInitialAmount); // Spending strength as state
  const [transferredAmount, setTransferredAmount] = useState(100); // Store amount at transfer time
  
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const strengthUpdateValue = useRef(new Animated.Value(1)).current;
  
  // Animation values for screen entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-15)).current;
  const cardAnim = useRef(new Animated.Value(20)).current;
  const transferAnim = useRef(new Animated.Value(15)).current;
  const sliderAnim = useRef(new Animated.Value(0)).current;
  const statusAnim = useRef(new Animated.Value(10)).current;
  const historyAnim = useRef(new Animated.Value(0)).current;
  
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
  
  // Handle transfer
  const handleTransfer = () => {
    setIsProcessing(true);
    
    // Start spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ).start();
    
    // Simulate processing delay
    setTimeout(() => {
      // Store the transferred amount for repayment calculations
      setTransferredAmount(selectedAmount);
      
      // Deduct transferred amount from eligible amount
      const newEligibleAmount = Math.max(0, eligibleAmount - selectedAmount);
      
      // Flash animation for spending strength update
      Animated.sequence([
        Animated.timing(strengthUpdateValue, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(strengthUpdateValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Update the eligible amount
      setEligibleAmount(newEligibleAmount);
      
      setIsProcessing(false);
      setHasTransferred(true);
      
      // Fade in repayment details
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
      
    }, 2000);
  };
  
  // Create spin interpolation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const minAmount = 100; // Minimum amount

  // Available duration options with interest rates
  const durationOptions: DurationOption[] = [
    { duration: '28 days', interestRate: '8.5%' },
    { duration: '3 months', interestRate: '6.0%' },
    { duration: '6 months', interestRate: '6.5%' },
    { duration: '12 months', interestRate: '9.0%' },
    { duration: '18 months', interestRate: '10.5%' },
    { duration: '24 months', interestRate: '11.9%' },
    { duration: '36 months', interestRate: '13.3%' },
    { duration: '48 months', interestRate: '14.7%' },
    { duration: '60 months', interestRate: '16.0%' }
  ];

  // Calculate real percentage based on amount selection
  const realPercentage = Math.round((selectedAmount / maxInitialAmount) * 100);
  
  // Check if amount is minimum
  const isMinimumAmount = selectedAmount === minAmount;

  // Calculate loan details
  const calculateLoanDetails = () => {
    // Use transferredAmount for repayment calculations if transfer has been made
    const amountToCalculate = hasTransferred ? transferredAmount : selectedAmount;
    
    // Get the interest rate as a number
    const interestRateStr = selectedDuration.interestRate;
    const interestRate = parseFloat(interestRateStr.replace('%', '')) / 100;
    
    // Convert duration to months for calculation
    let durationInMonths = 0;
    if (selectedDuration.duration.includes('days')) {
      durationInMonths = 28 / 30; // Approximately one month
    } else {
      durationInMonths = parseInt(selectedDuration.duration.split(' ')[0]);
    }
    
    // Calculate interest amount (simple interest for simplicity)
    let interestAmount = amountToCalculate * interestRate * durationInMonths / 12;
    
    // For 28-day loans, we have a minimum interest amount
    if (selectedDuration.duration === '28 days') {
      const minimumInterest = 8; // Minimum flat fee of ₹8 for short-term loans
      interestAmount = Math.max(interestAmount, minimumInterest);
    }
    
    // Calculate total repayment
    const totalRepayment = amountToCalculate + interestAmount;
    
    // Calculate EMI (for loans > 1 month)
    let emi = 0;
    if (durationInMonths >= 1) {
      emi = totalRepayment / durationInMonths;
    } else {
      emi = totalRepayment; // For short term loans, full amount is paid at once
    }
    
    // Calculate repayment date
    const today = new Date();
    let repaymentDate = new Date(today);
    
    if (selectedDuration.duration.includes('days')) {
      repaymentDate.setDate(today.getDate() + parseInt(selectedDuration.duration.split(' ')[0]));
    } else {
      repaymentDate.setMonth(today.getMonth() + durationInMonths);
    }
    
    const formattedRepaymentDate = repaymentDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    return {
      principal: amountToCalculate,
      interestAmount: Math.round(interestAmount),
      totalRepayment: Math.round(totalRepayment),
      emi: Math.round(emi),
      repaymentDate: formattedRepaymentDate,
      hasMinimumInterest: selectedDuration.duration === '28 days' && interestAmount === 8
    };
  };
  
  const loanDetails = calculateLoanDetails();

  // Track circle dimensions
  const [circleDimensions, setCircleDimensions] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  // Handle layout changes to get accurate dimensions
  const onCircleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setCircleDimensions({ x, y, width, height });
  };

  // Handle slider value change
  const handleSliderChange = (value: number) => {
    // Only update if the value is within valid range
    if (value >= 0 && value <= (eligibleAmount - minAmount)) {
      // Calculate amount based on slider position
      const calculatedAmount = Math.round(minAmount + value);
      
      // Ensure we don't exceed the eligible amount
      const finalAmount = Math.min(calculatedAmount, eligibleAmount);
      
      // Update both state values
      setSliderValue(value);
      setSelectedAmount(finalAmount);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Generate triangle indicators
  const renderTriangles = () => {
    const triangles = [];
    const totalTriangles = 20;
    const trianglesToFill = Math.ceil((realPercentage / 100) * totalTriangles);
    
    for (let i = 0; i < totalTriangles; i++) {
      const isFilled = i < trianglesToFill;
      
      triangles.push(
        <View 
          key={i} 
          style={[
            styles.triangle, 
            { 
              backgroundColor: isFilled ? 'rgb(52, 149, 0)' : 'rgba(52, 149, 0, 0.2)',
              marginLeft: i === 0 ? 0 : 2
            }
          ]}
        />
      );
    }
    
    return triangles;
  };

  // Toggle duration dropdown modal
  const toggleDurationModal = () => {
    setIsDurationModalVisible(!isDurationModalVisible);
  };

  // Handle duration selection
  const handleSelectDuration = (option: DurationOption) => {
    setSelectedDuration(option);
    toggleDurationModal();
  };

  // Configure professional, simple entrance animations
  useEffect(() => {
    // Master fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Header slides down subtly
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Card slides up subtly
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 600,
      delay: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Transfer section slides up
    Animated.timing(transferAnim, {
      toValue: 0,
      duration: 600,
      delay: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Slider fades in
    Animated.timing(sliderAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Status section slides up
    Animated.timing(statusAnim, {
      toValue: 0,
      duration: 600,
      delay: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // History section fades in
    Animated.timing(historyAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        {/* Header with subtle animation */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: headerAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Borrow</Text>
          <View style={styles.spacer} />
        </Animated.View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Eligible Amount Section with subtle animation */}
          <Animated.View 
            style={[
              styles.eligibleAmountContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)']}
              style={styles.eligibleAmountGradient}
            >
              <Animated.View 
                style={[
                  styles.eligibleAmountContent,
                  { opacity: strengthUpdateValue }
                ]}
              >
                <View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.eligibleAmountLabel}>Spending Strength</Text>
                    <TouchableOpacity style={styles.infoIconContainer}>
                      <Ionicons name="information-circle-outline" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.eligibleAmountValue}>{formatAmount(eligibleAmount)}</Text>
                </View>
                <TouchableOpacity style={styles.applyEligibleButton}>
                  <Text style={styles.applyEligibleText}>Refresh</Text>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Section Title with fade animation */}
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { opacity: fadeAnim }
            ]}
          >
            Transfer to account
          </Animated.Text>
          
          {/* Transfer Details Section with subtle animation */}
          <Animated.View 
            style={[
              styles.transferDetailsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: transferAnim }]
              }
            ]}
          >
            <View style={styles.transferLeftSection}>
              <Text style={styles.transferAmountValue}>{formatAmount(selectedAmount)}</Text>
              <Text style={styles.transferDetail}>Select duration</Text>
              
              {/* Duration Dropdown */}
              <TouchableOpacity 
                style={styles.durationDropdown}
                onPress={toggleDurationModal}
              >
                <View style={styles.durationContent}>
                  <View>
                    <Text style={styles.durationText}>{selectedDuration.duration}</Text>
                    <Text style={styles.interestRateText}>Interest: {selectedDuration.interestRate} p.a.</Text>
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#ffffff" style={styles.dropdownIcon} />
                </View>
                <LinearGradient
                  colors={['rgba(52, 149, 0, 0.4)', 'rgba(52, 149, 0, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.durationGradient}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.transferButton,
                  (hasTransferred || isProcessing) && styles.transferButtonDisabled
                ]} 
                onPress={handleTransfer}
                disabled={hasTransferred || isProcessing}
              >
                {isProcessing ? (
                  <View style={styles.processingContainer}>
                    <Animated.View style={{transform: [{rotate: spin}]}}>
                      <Ionicons name="sync" size={16} color="#ffffff" />
                    </Animated.View>
                    <Text style={styles.transferButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.transferButtonText}>
                    {hasTransferred ? 'Transferred' : 'Transfer Now'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.transferRightSection}>
              {/* Percentage indicator circle */}
              <View style={styles.indicatorContainer}>
                {/* Circle indicator */}
              <Animated.View 
                style={styles.progressCircleContainer} 
                onLayout={onCircleLayout}
              >
                  <View style={[
                    styles.progressOuterRing, 
                    isMinimumAmount && styles.progressOuterRingMinimum
                  ]}>
                    <LinearGradient
                      colors={isMinimumAmount 
                        ? ['#ffb300', '#f57c00'] 
                        : ['rgb(52, 149, 0)', 'rgb(39, 110, 0)']}
                  style={styles.progressCircle}
                >
                  <View style={styles.progressInnerCircle}>
                        {isMinimumAmount ? (
                          <Text style={styles.progressTextMinimum}>Min</Text>
                        ) : (
                          <Text style={styles.progressText}>{realPercentage}%</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                  </Animated.View>
                  
                {/* Triangle indicators below */}
                <Animated.View style={styles.trianglesContainer}>
                  {renderTriangles()}
                </Animated.View>
              </View>
            </View>
          </Animated.View>
                  
          {/* Straight Line Slider with fade animation */}
          <Animated.View 
            style={[
              styles.sliderContainer,
              { opacity: sliderAnim }
            ]}
          >
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={eligibleAmount - minAmount}
              step={1}
              value={sliderValue}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={isMinimumAmount ? "#ffb300" : "rgb(52, 149, 0)"}
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor={isMinimumAmount ? "#f57c00" : "rgb(52, 149, 0)"}
              disabled={hasTransferred || isProcessing || eligibleAmount <= minAmount}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderMinLabel, isMinimumAmount && styles.sliderMinLabelHighlighted]}>{formatAmount(minAmount)}</Text>
              <Text style={styles.sliderMaxLabel}>{formatAmount(eligibleAmount)}</Text>
            </View>
          </Animated.View>
          
          {/* Borrowing Status Title */}
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { opacity: fadeAnim }
            ]}
          >
            {hasTransferred ? 'Repayments' : 'Borrowing Status'}
          </Animated.Text>

          {hasTransferred ? (
            <Animated.View style={[styles.repaymentContainer, {opacity: opacityValue}]}>
              <LinearGradient
                colors={['rgba(52, 149, 0, 0.15)', 'rgba(52, 149, 0, 0.05)']}
                style={styles.repaymentGradient}
              >
                <View style={styles.repaymentRow}>
                  <View style={styles.repaymentColumn}>
                    <Text style={styles.repaymentLabel}>Principal</Text>
                    <Text style={styles.repaymentValue}>{formatAmount(loanDetails.principal)}</Text>
                  </View>
                  <View style={styles.repaymentColumn}>
                    <Text style={styles.repaymentLabel}>Interest</Text>
                    <Text style={styles.repaymentValue}>{formatAmount(loanDetails.interestAmount)}</Text>
                    {loanDetails.hasMinimumInterest && (
                      <Text style={styles.minimumInterestText}>Minimum fee applied</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.repaymentDivider} />
                
                <View style={styles.repaymentRow}>
                  <View style={styles.repaymentColumn}>
                    <Text style={styles.repaymentLabel}>Total Repayment</Text>
                    <Text style={styles.repaymentTotalValue}>{formatAmount(loanDetails.totalRepayment)}</Text>
                  </View>
                  <View style={styles.repaymentColumn}>
                    <Text style={styles.repaymentLabel}>
                      {selectedDuration.duration.includes('days') ? 'Due Amount' : 'Monthly EMI'}
                    </Text>
                    <Text style={styles.repaymentValue}>{formatAmount(loanDetails.emi)}</Text>
                  </View>
                </View>
                
                <View style={styles.repaymentDivider} />
                
                <View style={styles.repaymentDateContainer}>
                  <View style={styles.repaymentDateIconContainer}>
                    <Ionicons name="calendar" size={16} color="rgb(52, 149, 0)" />
                  </View>
                  <View>
                    <Text style={styles.repaymentDateLabel}>
                      {selectedDuration.duration.includes('days') ? 'Due Date' : 'First EMI Date'}
                    </Text>
                    <Text style={styles.repaymentDateValue}>{loanDetails.repaymentDate}</Text>
                  </View>
                </View>
                
                <View style={styles.repaymentNote}>
                  <Ionicons name="information-circle" size={14} color="rgba(255, 255, 255, 0.7)" style={styles.repaymentNoteIcon} />
                  <Text style={styles.repaymentNoteText}>
                    Pay early and save up to 0.55% on interest charges.
                  </Text>
                </View>
                
                <View style={styles.paymentButtonsContainer}>
                  <TouchableOpacity style={styles.payEarlyButton}>
                    <Ionicons name="flash" size={16} color="#ffffff" style={styles.payEarlyIcon} />
                    <Text style={styles.payEarlyText}>Pay Early</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payDuesButton}>
                    <Ionicons name="calendar" size={16} color="#ffffff" style={styles.payDuesIcon} />
                    <Text style={styles.payDuesText}>Pay Dues</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <Animated.View 
              style={[
                styles.noLoanContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: statusAnim }]
                }
              ]}
            >
              <View style={styles.noLoanIconContainer}>
                <Ionicons name="wallet-outline" size={40} color="rgba(255, 255, 255, 0.5)" />
              </View>
              <Text style={styles.noLoanTitle}>No Active Borrowing</Text>
              <Text style={styles.noLoanText}>
                Set your borrowing amount and duration, then click "Transfer Now" to get started.
              </Text>
            </Animated.View>
          )}

          {/* History section with fade animation */}
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { opacity: historyAnim }
            ]}
          >
            History
          </Animated.Text>
          
          <Animated.View 
            style={[
              styles.paidLoanContainer,
              { opacity: historyAnim }
            ]}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.15)', 'rgba(76, 175, 80, 0.05)']}
              style={styles.paidLoanGradient}
            >
              <View style={styles.paidLoanHeader}>
                <View style={styles.paidLoanStatus}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.paidLoanStatusText}>PAID</Text>
                </View>
                <Text style={styles.paidLoanDate}>Closed on 15 Mar, 2023</Text>
              </View>
              
              <View style={styles.paidLoanDivider} />
              
              <View style={styles.paidLoanDetails}>
                <View style={styles.paidLoanLeft}>
                  <Text style={styles.paidLoanAmount}>{formatAmount(50000)}</Text>
                  <Text style={styles.paidLoanTerm}>6 months • 6.5% p.a.</Text>
                  <Text style={styles.paidLoanIdText}>ID: BORROW19283746</Text>
                </View>
                <View style={styles.paidLoanRight}>
                  <View style={styles.paidLoanMetric}>
                    <Text style={styles.paidLoanMetricLabel}>Borrowed</Text>
                    <Text style={styles.paidLoanMetricValue}>{formatAmount(50000)}</Text>
                  </View>
                  <View style={styles.paidLoanMetric}>
                    <Text style={styles.paidLoanMetricLabel}>Interest Paid</Text>
                    <Text style={styles.paidLoanMetricValue}>{formatAmount(1675)}</Text>
                  </View>
                  <View style={styles.paidLoanMetric}>
                    <Text style={styles.paidLoanMetricLabel}>Total Paid</Text>
                    <Text style={styles.paidLoanMetricValue}>{formatAmount(51675)}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewDetailButton}
                onPress={() => {
                  navigation.navigate('ViewDetails', {
                    loanDetails: {
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
                    }
                  });
                }}
              >
                <Text style={styles.viewDetailButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Bottom spacer for scrolling */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Duration Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isDurationModalVisible}
          onRequestClose={toggleDurationModal}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={toggleDurationModal}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Duration</Text>
                <TouchableOpacity onPress={toggleDurationModal}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={durationOptions}
                keyExtractor={(item) => item.duration}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.durationOption,
                      selectedDuration.duration === item.duration && styles.durationOptionSelected
                    ]}
                    onPress={() => handleSelectDuration(item)}
                  >
                    <View>
                      <Text 
                        style={[
                          styles.durationOptionText,
                          selectedDuration.duration === item.duration && styles.durationOptionTextSelected
                        ]}
                      >
                        {item.duration}
                      </Text>
                      <Text 
                        style={[
                          styles.durationOptionRateText,
                          selectedDuration.duration === item.duration && styles.durationOptionRateTextSelected
                        ]}
                      >
                        {item.interestRate} p.a.
                      </Text>
                    </View>
                    {selectedDuration.duration === item.duration && (
                      <Ionicons name="checkmark" size={20} color="rgb(52, 149, 0)" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </TouchableOpacity>
        </Modal>
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
  eligibleAmountContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eligibleAmountGradient: {
    borderRadius: 12,
    padding: 16,
  },
  eligibleAmountContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eligibleAmountLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  eligibleAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  applyEligibleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgb(52, 149, 0)',
    borderRadius: 20,
  },
  applyEligibleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 12,
  },
  quickLinksContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  quickLinkItem: {
    width: (width - 48) / 2,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickLinkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    marginLeft: 4,
    padding: 2,
    top: -1,
  },
  transferDetailsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  transferLeftSection: {
    flex: 2,
  },
  transferRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferAmountLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  transferAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  transferDetail: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  transferButton: {
    backgroundColor: 'rgb(52, 149, 0)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  transferButtonDisabled: {
    backgroundColor: 'rgba(52, 149, 0, 0.5)',
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  progressCircleContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressOuterRing: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: 'rgba(52, 149, 0, 0.2)',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOuterRingMinimum: {
    backgroundColor: 'rgba(255, 179, 0, 0.2)',
  },
  progressCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInnerCircle: {
    width: '75%',
    height: '75%',
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressTextMinimum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  trianglesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 10,
  },
  triangle: {
    width: 4,
    height: 10,
    backgroundColor: 'rgb(52, 149, 0)',
    borderRadius: 1,
  },
  sliderContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 20, // Increased height for better visibility and interaction
    marginVertical: 10, // Added margin for more space
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  sliderMinLabel: {
    color: '#cccccc',
    fontSize: 12,
  },
  sliderMinLabelHighlighted: {
    color: '#ffb300',
    fontWeight: '600',
  },
  sliderMaxLabel: {
    color: '#cccccc',
    fontSize: 12,
  },
  durationDropdown: {
    marginBottom: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    width: '95%',  // Slightly increased for two lines
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1,
  },
  durationGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 149, 0, 0.3)',
  },
  durationText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  interestRateText: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 2,
  },
  dropdownIcon: {
    marginLeft: 4,
    fontSize: 14,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  durationOptionSelected: {
    backgroundColor: 'rgba(52, 149, 0, 0.1)',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  durationOptionTextSelected: {
    color: 'rgb(52, 149, 0)',
    fontWeight: '600',
  },
  durationOptionRateText: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 2,
  },
  durationOptionRateTextSelected: {
    color: 'rgba(52, 149, 0, 0.8)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  repaymentContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  repaymentGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 149, 0, 0.2)',
  },
  repaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  repaymentColumn: {
    flex: 1,
  },
  repaymentLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
  },
  repaymentValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  repaymentTotalValue: {
    fontSize: 16,
    color: 'rgb(52, 149, 0)',
    fontWeight: '700',
  },
  repaymentDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  repaymentDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  repaymentDateIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 149, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  repaymentDateLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 2,
  },
  repaymentDateValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  repaymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  repaymentNoteIcon: {
    marginRight: 6,
  },
  repaymentNoteText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  paymentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  payEarlyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 149, 0, 0.8)',
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  payDuesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 149, 0, 0.8)',
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
  },
  payEarlyIcon: {
    marginRight: 8,
  },
  payDuesIcon: {
    marginRight: 8,
  },
  payEarlyText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  payDuesText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  noLoanContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noLoanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noLoanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  noLoanText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  minimumInterestText: {
    fontSize: 10,
    color: '#ffb300',
    marginTop: 2,
  },
  paidLoanContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paidLoanGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  paidLoanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paidLoanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paidLoanStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 4,
  },
  paidLoanDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  paidLoanDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  paidLoanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paidLoanLeft: {
    flex: 1,
  },
  paidLoanRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  paidLoanAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  paidLoanTerm: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  paidLoanIdText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  paidLoanMetric: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  paidLoanMetricLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 2,
  },
  paidLoanMetricValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  viewDetailButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 6,
  },
});

export default Borrow;