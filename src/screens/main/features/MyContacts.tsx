import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Platform,
  NativeModules,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

const { ContactModule } = NativeModules;

const MyContacts: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<{ name: string; phone: string; photo: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission denied');
        setIsLoading(false);
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
    } finally {
      setIsLoading(false);
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

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone}`;
    }
    return phone;
  };

  // Handle Go Back action
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TransferMoney');
    }
  };

  // Navigate to UserPay screen
  const navigateToUserPay = (contact: { name: string; phone: string; photo: string }) => {
    navigation.navigate('UserPay', {
      contactName: contact.name,
      contactPhone: contact.phone,
      contactPhoto: contact.photo,
    });
  };

  // Skeleton Loading Component
  const renderSkeletonLoading = () => {
    return (
      <View>
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={index} style={styles.skeletonContactItem}>
            <View style={styles.skeletonContactImage} />
            <View style={styles.skeletonContactInfo}>
              <View style={styles.skeletonContactName} />
              <View style={styles.skeletonContactPhone} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={{marginLeft: 10}}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={{width: 40}} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, number or UPI ID"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Transfer Options */}
        <View style={styles.transferOptionsContainer}>
          <TouchableOpacity 
            style={styles.transferOption}
            onPress={() => navigation.navigate('SelfTransfer')}
          >
            <View style={styles.transferOptionIcon}>
              <MaterialIcons name="auto-mode" size={20} color="#fff" />
            </View>
            <Text style={styles.transferOptionText}>Self transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.transferOption}
            onPress={() => navigation.navigate('BankTransfer')}
          >
            <View style={styles.transferOptionIcon}>
              <MaterialIcons name="assured-workload" size={20} color="#fff" />
            </View>
            <Text style={styles.transferOptionText}>Bank transfer</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          renderSkeletonLoading()
        ) : contacts.length === 0 ? (
          <Text style={styles.noContactsText}>No contacts found.</Text>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => navigateToUserPay(item)}
              >
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.contactImage} />
                ) : (
                  <View style={styles.contactPlaceholder}>
                    <Text style={styles.initials}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{formatPhoneNumber(item.phone)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    marginTop: 10
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 50,
    paddingHorizontal: 16,
    marginBottom: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 6,
  },
  contactImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 10,
  },
  contactPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initials: {
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
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#888',
  },
  noContactsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
  },
  skeletonContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 6,
  },
  skeletonContactImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#333',
  },
  skeletonContactInfo: {
    flex: 1,
  },
  skeletonContactName: {
    height: 15,
    width: '60%',
    backgroundColor: '#333',
    marginBottom: 6,
  },
  skeletonContactPhone: {
    height: 13,
    width: '40%',
    backgroundColor: '#333',
  },
  transferOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 50,
    width: '48%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  transferOptionIcon: {
    marginRight: 8,
  },
  transferOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});

export default MyContacts;