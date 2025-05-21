import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Image,
  FlatList,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Dummy contact data for demonstration
const dummyContacts = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', upiId: 'rahul@okicici' },
  { id: '2', name: 'Priya Patel', phone: '+91 87654 32109', upiId: 'priya@okaxis' },
  { id: '3', name: 'Amit Singh', phone: '+91 76543 21098', upiId: 'amit@okhdfc' },
  { id: '4', name: 'Neha Gupta', phone: '+91 65432 10987', upiId: 'neha@oksbi' },
  { id: '5', name: 'Vikram Verma', phone: '+91 54321 09876', upiId: 'vikram@okybl' },
];

const { ContactModule } = NativeModules;

const SendMoneyForum: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { amount = '0' } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Primary Account');
  const [accountNumber, setAccountNumber] = useState('XXXX XXXX 5678'); // Masked account number
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ name: string; phone: string; photo: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<{ name: string; phone: string; photo: string }[]>([]);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  // Animation for search bar border
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const skeletonAnimation = useRef(new Animated.Value(0)).current;
  
  // Fetch contacts from device
  const fetchContacts = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission denied');
        return;
      }
    }

    try {
      const fetchedContacts = await ContactModule.getContacts();
      console.log('Fetched Contacts:', fetchedContacts);

      // Remove duplicates and format numbers
      const uniqueContacts = removeDuplicatesAndFormat(fetchedContacts);

      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Function to normalize phone numbers and remove duplicates
  const removeDuplicatesAndFormat = (contacts: { name: string; phone: string; photo: string }[]) => {
    const seen = new Map();

    return contacts
      .map((contact) => {
        let normalizedPhone = contact.phone.replace(/\D/g, ''); // Remove non-numeric characters

        // Remove country codes (keep last 10 digits)
        if (normalizedPhone.length > 10) {
          normalizedPhone = normalizedPhone.slice(-10);
        }

        if (!seen.has(normalizedPhone)) {
          seen.set(normalizedPhone, true);
          return { name: contact.name, phone: normalizedPhone, photo: contact.photo || '' };
        }
        return null;
      })
      .filter((contact): contact is { name: string; phone: string; photo: string } => contact !== null);
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone}`;
    }
    return phone;
  };
  
  // Set up the animation
  useEffect(() => {
    // Create a looping animation
    Animated.loop(
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false, // We need this to be false for border color animations
      })
    ).start();
  }, []);
  
  // Set up skeleton animation
  useEffect(() => {
    if (isLoading) {
      // Start the skeleton animation when loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          Animated.timing(skeletonAnimation, {
            toValue: 0,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      // Reset animation when done loading
      skeletonAnimation.setValue(0);
    }
  }, [isLoading]);
  
  // Interpolate the animated value to create professional border colors
  const borderColor = borderAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#333', '#4A5568', '#5A67D8', '#4A5568', '#333'],
  });
  
  // Create subtle shadow opacity that pulses
  const shadowOpacity = borderAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.25, 0.1],
  });
  
  // Create shadow color that complements the border
  const shadowColor = borderAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#333', '#5A67D8', '#333'],
  });
  
  // Background color for skeleton animation - more subtle gradient
  const skeletonBgColor = skeletonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1A1A1A', '#2A2A2A'],
  });
  
  // Opacity for skeleton shimmer effect
  const skeletonOpacity = skeletonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0.9],
  });
  
  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    
    if (text.length > 0) {
      setIsSearching(true);
      setIsLoading(true);
      
      // Search contacts after a short delay
      setTimeout(() => {
        // Filter contacts based on search
        const filteredContacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(text.toLowerCase()) ||
          contact.phone.includes(text)
        );
        
        setSearchResults(filteredContacts);
        setIsLoading(false);
      }, 500);
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setIsLoading(false);
    }
  };
  
  // Select a contact and navigate to payment screen
  const handleSelectContact = (contact: { name: string; phone: string; photo: string }) => {
    navigation.navigate('UserPay', {
      contactName: contact.name,
      contactPhone: contact.phone,
      contactPhoto: contact.photo,
      amount: amount
    });
  };
  
  // Render skeleton loader for contacts
  const renderSkeletonLoader = () => {
    return Array(4).fill(0).map((_, index) => (
      <Animated.View 
        key={`skeleton-${index}`} 
        style={[
          styles.skeletonContactItem, 
          { opacity: skeletonOpacity }
        ]}
      >
        <Animated.View style={[
          styles.skeletonAvatar, 
          { backgroundColor: skeletonBgColor }
        ]} />
        <View style={styles.skeletonContent}>
          <Animated.View 
            style={[
              styles.skeletonText, 
              { 
                width: '60%', 
                backgroundColor: skeletonBgColor,
                marginBottom: 6 
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.skeletonTextSmall, 
              { 
                width: '40%', 
                backgroundColor: skeletonBgColor 
              }
            ]} 
          />
        </View>
      </Animated.View>
    ));
  };
  
  // Handle note button press
  const handleNotePress = () => {
    setShowNoteModal(true);
  };
  
  // Handle saving the note
  const handleSaveNote = () => {
    // Save the note (you can add actual implementation later)
    setShowNoteModal(false);
  };
  
  // Handle closing the note modal
  const handleCloseNoteModal = () => {
    setShowNoteModal(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay ₹{amount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.noteButton}
          onPress={handleNotePress}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Note Modal */}
      {showNoteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Note</Text>
              <TouchableOpacity onPress={handleCloseNoteModal}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Enter note for this payment..."
              placeholderTextColor="#999"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              maxLength={100}
            />
            <View style={styles.noteCharCount}>
              <Text style={styles.noteCharCountText}>{noteText.length}/100</Text>
            </View>
            <TouchableOpacity style={styles.saveNoteButton} onPress={handleSaveNote}>
              <Text style={styles.saveNoteButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.formContainer} contentContainerStyle={styles.contentContainer}>
        {/* From Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>From</Text>
          <View style={styles.accountSelector}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountText}>{selectedAccount}</Text>
              <View style={styles.accountNumberRow}>
                <Text style={styles.accountNumber}>{accountNumber}</Text>
                <TouchableOpacity style={styles.checkBalanceButton}>
                  <Text style={styles.checkBalanceText}>Check Balance</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* To Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>To</Text>
          <Animated.View style={[
            styles.searchContainer,
            {
              borderColor: borderColor,
              shadowOpacity: shadowOpacity,
              shadowColor: shadowColor,
              elevation: 4,
            }
          ]}>
            <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, number or UPI ID"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearchChange}
            />
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Show either search results or transfer options */}
        {isSearching ? (
          <View style={styles.contactsContainer}>
            {isLoading ? (
              // Show skeleton loaders while loading
              renderSkeletonLoader()
            ) : searchResults.length > 0 ? (
              // Show search results
              searchResults.map((contact, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.contactItem} 
                  onPress={() => handleSelectContact(contact)}
                >
                  {contact.photo ? (
                    <Image source={{ uri: contact.photo }} style={styles.contactAvatar} />
                  ) : (
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>{contact.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactDetail}>{formatPhoneNumber(contact.phone)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // No results found
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={48} color="#666" />
                <Text style={styles.noResultsText}>No users found</Text>
                <TouchableOpacity style={styles.referContainer}>
                  <MaterialIcons name="card-giftcard" size={20} color="#fff" />
                  <Text style={styles.referText}>Refer friends to get ₹350</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          // Transfer Options
          <View style={styles.transferOptions}>
            <TouchableOpacity style={styles.transferOption}>
              <View style={styles.transferOptionIcon}>
                <MaterialIcons name="auto-mode" size={18} color="#fff" />
              </View>
              <Text style={styles.transferOptionText}>Self Transfer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.transferOption}>
              <View style={styles.transferOptionIcon}>
                <MaterialIcons name="account-balance" size={18} color="#fff" />
              </View>
              <Text style={styles.transferOptionText}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'left',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginTop: 28,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#999',
    marginBottom: 12,
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  accountText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '500',
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accountNumber: {
    fontSize: 13,
    color: '#999',
    marginRight: 8,
  },
  checkBalanceButton: {
    backgroundColor: '#5A67D8',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#5A67D8',
  },
  checkBalanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#333',
    shadowColor: '#5A67D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  transferOptions: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#333',
  },
  transferOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  transferOptionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  contactsContainer: {
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#999',
  },
  skeletonContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonText: {
    height: 14,
    borderRadius: 7,
  },
  skeletonTextSmall: {
    height: 12,
    borderRadius: 6,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    color: '#999',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  referContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 103, 216, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(90, 103, 216, 0.25)',
  },
  referText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  noteButton: {
    padding: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  noteInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteCharCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  noteCharCountText: {
    color: '#999',
    fontSize: 12,
  },
  saveNoteButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveNoteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SendMoneyForum;
