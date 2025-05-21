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
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Dummy contact data for demonstration
const dummyContacts = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', upiId: 'rahul@okicici', photo: '' },
  { id: '2', name: 'Priya Patel', phone: '+91 87654 32109', upiId: 'priya@okaxis', photo: '' },
  { id: '3', name: 'Amit Singh', phone: '+91 76543 21098', upiId: 'amit@okhdfc', photo: '' },
  { id: '4', name: 'Neha Gupta', phone: '+91 65432 10987', upiId: 'neha@oksbi', photo: '' },
  { id: '5', name: 'Vikram Verma', phone: '+91 54321 09876', upiId: 'vikram@okybl', photo: '' },
];

const { ContactModule } = NativeModules;

const RequestMoneyForum: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { amount = '0', note = '' } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ name: string; phone: string; photo: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ name: string; phone: string; photo: string }[]>([]);
  const [recentContacts, setRecentContacts] = useState<{ name: string; phone: string; photo: string }[]>([]);
  
  // Animation for search bar border
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const skeletonAnimation = useRef(new Animated.Value(0)).current;
  
  // Circular highlight animation
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  
  // Fetch contacts from device
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: "Contacts Permission",
            message: "This app needs access to your contacts to send money requests.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission denied');
          setLoadError('Permission to access contacts was denied');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn(err);
        setLoadError('Error requesting permission');
        setIsLoading(false);
        return;
      }
    }

    try {
      const fetchedContacts = await ContactModule.getContacts();
      console.log('Fetched Contacts count:', fetchedContacts.length);

      // Remove duplicates and format numbers
      const uniqueContacts = removeDuplicatesAndFormat(fetchedContacts);
      
      // Sort contacts alphabetically
      uniqueContacts.sort((a, b) => a.name.localeCompare(b.name));

      setContacts(uniqueContacts);
      
      // Set some recent contacts (first 5 for demo purposes - in a real app you'd use actual recent contacts)
      if (uniqueContacts.length > 0) {
        setRecentContacts(uniqueContacts.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoadError('Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    setupAnimations();
  }, [fetchContacts]);

  // Setup all animations
  const setupAnimations = () => {
    // Border animation
    Animated.loop(
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      })
    ).start();
    
    // Highlight animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(highlightAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // Function to normalize phone numbers and remove duplicates
  const removeDuplicatesAndFormat = (contacts: { name: string; phone: string; photo: string }[]) => {
    const seen = new Map();

    return contacts
      .map((contact) => {
        if (!contact.name || !contact.phone) return null;
        
        let normalizedPhone = contact.phone.replace(/\D/g, ''); // Remove non-numeric characters

        // Remove country codes (keep last 10 digits)
        if (normalizedPhone.length > 10) {
          normalizedPhone = normalizedPhone.slice(-10);
        }

        // Skip entries with very short phone numbers
        if (normalizedPhone.length < 5) return null;

        if (!seen.has(normalizedPhone)) {
          seen.set(normalizedPhone, true);
          return { 
            name: contact.name.trim(), 
            phone: normalizedPhone, 
            photo: contact.photo || '' 
          };
        }
        return null;
      })
      .filter((contact): contact is { name: string; phone: string; photo: string } => 
        contact !== null && contact.name.length > 0
      );
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone}`;
    }
    return phone;
  };
  
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
      
      // Search contacts after a short delay to improve UX
      setTimeout(() => {
        // Filter contacts based on search
        const filteredContacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(text.toLowerCase()) ||
          contact.phone.includes(text)
        );
        
        setSearchResults(filteredContacts);
        setIsLoading(false);
      }, 300);
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setIsLoading(false);
    }
  };
  
  // Select a contact and navigate to payment confirmation screen
  const handleSelectContact = (contact: { name: string; phone: string; photo: string }) => {
    navigation.navigate('RequestConfirmation', {
      contactName: contact.name,
      contactPhone: contact.phone,
      contactPhoto: contact.photo,
      amount: amount,
      note: note
    });
  };
  
  // Retry loading contacts
  const handleRetry = () => {
    fetchContacts();
  };
  
  // Render skeleton loader for contacts
  const renderSkeletonLoader = () => {
    return Array(5).fill(0).map((_, index) => (
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
  
  // Badge with animated border
  const renderAmountBadge = () => {
    return (
      <Animated.View 
        style={[
          styles.amountBadge,
          {
            borderColor: highlightAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['#5A67D8', '#7F8FE9']
            }),
          }
        ]}
      >
        <Text style={styles.amountBadgeText}>₹{amount}</Text>
      </Animated.View>
    );
  };

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={48} color="#666" />
      <Text style={styles.errorText}>{loadError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <MaterialIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
  
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
          <Text style={styles.headerTitle}>Request ₹{amount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('Info', 'Request money from any contact. They will receive a notification to pay you.')}
        >
          <MaterialIcons name="info-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer} contentContainerStyle={styles.contentContainer}>
        {/* Search Container */}
        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>Send request to</Text>
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
              autoFocus
            />
          </Animated.View>
        </View>

        {/* Note Badge if note exists */}
        {note ? (
          <View style={styles.noteBadge}>
            <MaterialIcons name="note" size={16} color="#fff" />
            <Text style={styles.noteText} numberOfLines={1}>{note}</Text>
          </View>
        ) : null}

        {/* Amount Badge */}
        {renderAmountBadge()}

        {/* Show either search results, loading state, error state or contacts */}
        <View style={styles.contactsContainer}>
          {loadError ? (
            renderErrorState()
          ) : isLoading ? (
            renderSkeletonLoader()
          ) : isSearching && searchResults.length > 0 ? (
            // Show search results
            <>
              <Text style={styles.resultsLabel}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `search-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.contactItem} 
                    onPress={() => handleSelectContact(item)}
                  >
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.contactAvatar} />
                    ) : (
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactDetail}>{formatPhoneNumber(item.phone)}</Text>
                    </View>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </>
          ) : isSearching && searchResults.length === 0 ? (
            // No results found
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={48} color="#666" />
              <Text style={styles.noResultsText}>No users found</Text>
              <TouchableOpacity style={styles.inviteContainer}>
                <MaterialIcons name="share" size={20} color="#fff" />
                <Text style={styles.inviteText}>Invite friends to join</Text>
              </TouchableOpacity>
            </View>
          ) : contacts.length === 0 && isSearching ? (
            // No contacts when searching
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="people-outline" size={48} color="#666" />
              <Text style={styles.noResultsText}>No contacts found</Text>
              <TouchableOpacity style={styles.inviteContainer} onPress={() => navigation.navigate('MyContacts')}>
                <MaterialIcons name="contact-page" size={20} color="#fff" />
                <Text style={styles.inviteText}>Manage Contacts</Text>
              </TouchableOpacity>
            </View>
          ) : !isSearching ? (
            // Show search prompt when not searching
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search" size={48} color="#666" />
              <Text style={styles.noResultsText}>Enter a name or number to search</Text>
            </View>
          ) : (
            // Show recent contacts and all contacts when searching with results
            <>
              {/* Recent Contacts Section */}
              <Text style={styles.sectionTitle}>Recent Contacts</Text>
              <FlatList
                data={recentContacts}
                keyExtractor={(item, index) => `recent-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.recentContactItem} 
                    onPress={() => handleSelectContact(item)}
                  >
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.recentContactAvatar} />
                    ) : (
                      <View style={styles.recentContactAvatar}>
                        <Text style={styles.contactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.recentContactName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.recentContactsContainer}
              />
              
              {/* All Contacts Section */}
              <Text style={styles.sectionTitle}>All Contacts</Text>
              <FlatList
                data={contacts.slice(0, 15)} // Limiting to 15 contacts for better performance
                keyExtractor={(item, index) => `contact-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.contactItem} 
                    onPress={() => handleSelectContact(item)}
                  >
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.contactAvatar} />
                    ) : (
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactDetail}>{formatPhoneNumber(item.phone)}</Text>
                    </View>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
              
              {/* View all contacts button */}
              {contacts.length > 15 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('MyContacts')}
                >
                  <Text style={styles.viewAllText}>View All Contacts</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#5A67D8" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
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
  infoButton: {
    padding: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
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
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 103, 216, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(90, 103, 216, 0.3)',
  },
  noteText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  amountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(90, 103, 216, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5A67D8',
    marginBottom: 24,
  },
  amountBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  resultsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 12,
  },
  contactsContainer: {
    marginTop: 12,
  },
  recentContactsContainer: {
    paddingBottom: 16,
  },
  recentContactItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  recentContactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  recentContactName: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    width: 70,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  viewAllText: {
    color: '#5A67D8',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
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
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 103, 216, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(90, 103, 216, 0.25)',
  },
  inviteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A67D8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default RequestMoneyForum;
