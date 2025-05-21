import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Image,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LiveSupportScreenNavigationProp } from '../../../types/navigation';
import { useNavigation } from '@react-navigation/native';

const AGENT_AVATAR = 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1747373314/touchpay_1_snko6o.jpg';
const USER_AVATAR = 'https://res.cloudinary.com/dojodcwxm/image/upload/fl_preserve_transparency/v1746203887/oliveit/registrations/yuae5vufae2k8uwrtoit.jpg';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  media?: {
    type: 'image' | 'file';
    url: string;
    name?: string;
    size?: string;
  };
}

const LiveSupport: React.FC = () => {
  const navigation = useNavigation<LiveSupportScreenNavigationProp>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const attachmentAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const [selectedMedia, setSelectedMedia] = useState<{
    type: 'image' | 'file';
    url: string;
    name?: string;
    size?: string;
  } | null>(null);

  // Initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: 'Hello! Welcome to TouchPay support. How can I help you today?',
        sender: 'agent',
        timestamp: Date.now() - 3600000,
        status: 'read',
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Simulate agent typing when user sends a message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user') {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        respondToUserMessage(lastMessage.text);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Simulate agent response based on user message
  const respondToUserMessage = (userMessage: string) => {
    let responseText = "I understand. Let me check that for you. Is there anything else you'd like to know?";
    
    if (userMessage.toLowerCase().includes('payment') || userMessage.toLowerCase().includes('transaction')) {
      responseText = "I can see your recent transaction is being processed. It usually takes 1-2 business days to reflect in your account. Would you like me to check anything specific about it?";
    } else if (userMessage.toLowerCase().includes('account') || userMessage.toLowerCase().includes('profile')) {
      responseText = "Your account is in good standing. All your documents are valid and up to date. Is there anything specific about your account you'd like to know?";
    } else if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('issue')) {
      responseText = "I'm here to help! Could you please provide more details about what you're experiencing so I can assist you better?";
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: responseText,
      sender: 'agent',
      timestamp: Date.now(),
      status: 'delivered',
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const refreshChats = () => {
    setIsRefreshing(true);
    
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    // Simulate a loading state
    setTimeout(() => {
      // Generate a new agent message to simulate new chats
      const newMessage: Message = {
        id: Date.now().toString(),
        text: "I've just received an update. Your transaction has been processed successfully. Is there anything else you'd like assistance with?",
        sender: 'agent',
        timestamp: Date.now(),
        status: 'delivered',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsRefreshing(false);
      rotateAnimation.setValue(0); // Reset rotation
    }, 1500);
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    Keyboard.dismiss();
  };

  const sendMediaMessage = (type: 'image' | 'file') => {
    let media = {
      type,
      url: type === 'image' 
        ? 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
        : '',
      name: type === 'file' ? 'transaction_receipt.pdf' : undefined,
      size: type === 'file' ? '156 KB' : undefined,
    };

    setSelectedMedia(media);
    setShowAttachmentOptions(false);
  };

  const sendSelectedMedia = () => {
    if (!selectedMedia) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim() ? message : (selectedMedia.type === 'image' ? '' : 'I\'ve attached my receipt for reference.'),
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent',
      media: selectedMedia,
    };

    setMessages(prev => [...prev, newMessage]);
    setSelectedMedia(null);
    setMessage('');
  };

  const cancelMediaSelection = () => {
    setSelectedMedia(null);
  };

  const toggleAttachmentOptions = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
    Animated.timing(attachmentAnimation, {
      toValue: showAttachmentOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isImage = item.media?.type === 'image';
    const isFile = item.media?.type === 'file';
    const hasText = item.text !== '';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.agentMessageContainer]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.agentBubble,
          isImage && styles.imageMessageBubble,
          isFile && styles.fileMessageBubble,
          (isFile && hasText) && styles.fileWithTextBubble
        ]}>
          {isImage && (
            <Image
              source={{ uri: item.media?.url }}
              style={styles.mediaImage}
              resizeMode="contain"
            />
          )}
          
          {isFile && (
            <View style={styles.fileAttachment}>
              <MaterialCommunityIcons name="file-pdf-box" size={30} color="#FF5252" />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">{item.media?.name}</Text>
                <Text style={styles.fileSize}>{item.media?.size}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Feather name="download" size={16} color="#00D09C" />
              </TouchableOpacity>
            </View>
          )}
          
          {hasText && (
            <Text style={[
              styles.messageText, 
              isUser ? styles.userMessageText : styles.agentMessageText,
              isFile && styles.messageTextWithFile
            ]}>
              {item.text}
            </Text>
          )}
          
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            {isUser && (
              <Text style={styles.statusIcon}>
                {' '}
                {item.status === 'sent' && <Ionicons name="checkmark" size={14} color="#8A8A8A" />}
                {item.status === 'delivered' && <Ionicons name="checkmark-done" size={14} color="#8A8A8A" />}
                {item.status === 'read' && <Ionicons name="checkmark-done" size={14} color="#00D09C" />}
              </Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  const attachmentOptionsTranslateY = attachmentAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  // Create the interpolated rotation value
  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>TouchPay</Text>
          <Text style={styles.headerSubtitle}>Customer Support</Text>
        </View>
        
        <TouchableOpacity onPress={refreshChats} style={styles.headerButton} disabled={isRefreshing}>
          <Animated.View style={isRefreshing ? { transform: [{ rotate: spin }] } : undefined}>
            <MaterialCommunityIcons 
              name="refresh" 
              size={24} 
              color="#00D09C"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.messagesContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          contentInset={{ bottom: 70 }}
          contentInsetAdjustmentBehavior="always"
        />
        
        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <View style={styles.typingAnimation}>
                <View style={styles.typingDot1} />
                <View style={styles.typingDot2} />
                <View style={styles.typingDot3} />
              </View>
            </View>
          </View>
        )}

        {/* Selected Media Preview */}
        {selectedMedia && (
          <View style={styles.selectedMediaContainer}>
            {selectedMedia.type === 'image' ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedMedia.url }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={cancelMediaSelection}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.filePreviewContainer}>
                <MaterialCommunityIcons name="file-pdf-box" size={30} color="#FF5252" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{selectedMedia.name}</Text>
                  <Text style={styles.fileSize}>{selectedMedia.size}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={cancelMediaSelection}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={toggleAttachmentOptions} style={styles.attachButton}>
            <MaterialCommunityIcons name="paperclip" size={24} color="#8A8A8A" />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#8A8A8A"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (message.trim() || selectedMedia) ? styles.sendButtonActive : null
            ]}
            onPress={selectedMedia ? sendSelectedMedia : sendMessage}
            disabled={!message.trim() && !selectedMedia}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={24} 
              color={(message.trim() || selectedMedia) ? "#00D09C" : "#555"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Options */}
      {showAttachmentOptions && (
        <>
          <TouchableOpacity 
            style={styles.attachmentOptionsOverlay}
            activeOpacity={0.7}
            onPress={() => setShowAttachmentOptions(false)}
          />
          <Animated.View 
            style={[
              styles.attachmentOptions, 
              { transform: [{ translateY: attachmentOptionsTranslateY }] }
            ]}
          >
            <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
            <View style={styles.attachmentOptionsHeader}>
              <View style={styles.attachmentOptionsDragBar} />
              <TouchableOpacity 
                style={styles.attachmentOptionsCloseButton}
                onPress={() => setShowAttachmentOptions(false)}
              >
                <Icon name="close" size={22} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.attachmentOptionsContent}>
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => sendMediaMessage('image')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                  <MaterialCommunityIcons name="image" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.attachmentText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => sendMediaMessage('file')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: 'rgba(255, 82, 82, 0.2)' }]}>
                  <MaterialCommunityIcons name="file-document" size={28} color="#FF5252" />
                </View>
                <Text style={styles.attachmentText}>Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption}>
                <View style={[styles.attachmentIconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.2)' }]}>
                  <MaterialCommunityIcons name="map-marker" size={28} color="#2196F3" />
                </View>
                <Text style={styles.attachmentText}>Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption}>
                <View style={[styles.attachmentIconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
                  <MaterialCommunityIcons name="contacts" size={28} color="#FFC107" />
                </View>
                <Text style={styles.attachmentText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    justifyContent: 'flex-end',
  },
  agentMessageContainer: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
    flexShrink: 1,
    flexGrow: 0,
  },
  userBubble: {
    backgroundColor: '#004D40',
    borderTopRightRadius: 2,
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexShrink: 1,
  },
  agentBubble: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 2,
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  agentMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
  },
  statusIcon: {
    marginLeft: 4,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    maxHeight: 60,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 8,
    maxWidth: '70%',
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden',
  },
  fileSize: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 208, 156, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingIndicator: {
    marginLeft: 16,
    marginBottom: 24,
  },
  typingBubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    borderTopLeftRadius: 2,
    padding: 12,
    paddingVertical: 10,
    maxWidth: '60%',
  },
  typingAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 10,
  },
  typingDot1: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A8A8A',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDot2: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A8A8A',
    marginHorizontal: 2,
    opacity: 0.8,
  },
  typingDot3: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A8A8A',
    marginHorizontal: 2,
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 44,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(0, 208, 156, 0.1)',
  },
  attachmentOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  attachmentOptions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 60,
    borderTopColor: '#2A2A2A',
    zIndex: 2,
  },
  attachmentOptionsHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    marginTop: 10,
  },
  attachmentOptionsDragBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#444',
  },
  attachmentOptionsCloseButton: {
    position: 'absolute',
    right: 0,
    top: -5,
    padding: 5,
  },
  attachmentOptionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  attachmentOption: {
    alignItems: 'center',
    width: 70,
  },
  attachmentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    color: '#fff',
    fontSize: 12,
  },
  selectedMediaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    position: 'relative',
    maxHeight: 60,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageMessageBubble: {
    maxWidth: '98%',
    width: 280,
  },
  fileMessageBubble: {
    maxWidth: '98%',
    width: 280,
  },
  fileWithTextBubble: {
    maxHeight: 180,
  },
  messageTextWithFile: {
    marginTop: 8,
    maxHeight: 80,
    overflow: 'hidden',
  },
});

export default LiveSupport; 