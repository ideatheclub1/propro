import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MessageCircle, CreditCard as Edit } from 'lucide-react-native';
import { mockConversations } from '../data/mockData';
import { Conversation } from '../types';

export default function MessagesScreen({ navigation }: any) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const handleConversationPress = (conversation: Conversation) => {
    const otherUser = conversation.participants.find(p => p.id !== '1'); // Assuming '1' is current user
    if (otherUser) {
      router.push({
        pathname: '/conversation',
        params: { userId: otherUser.id, userName: otherUser.username }
      });
    }
  };

  const handleUserPress = (userId: string) => {
    if (userId === '1') {
      Alert.alert(
        'Your Profile',
        'You are viewing your own profile. To make changes, go to your settings.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Go to Profile', 
            onPress: () => router.push('/(tabs)/profile')
          }
        ]
      );
      return;
    }
    router.push({
      pathname: '/ProfileScreen',
      params: { userId }
    });
  };

  const handleNewMessage = () => {
    Alert.alert('New Message', 'Select a user to start a new conversation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2A1A55', '#1E0D36', '#2A1A55']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          <View style={styles.headerLeft}>
            <MessageCircle size={28} color="#e0aaff" />
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <TouchableOpacity onPress={handleNewMessage} style={styles.newMessageButton}>
            <Edit size={24} color="#9B61E5" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              const otherUser = conversation.participants.find(p => p.id !== '1');
              if (!otherUser) return null;

              return (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => handleConversationPress(conversation)}
                >
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                    style={styles.conversationCard}
                  >
                    <View style={styles.avatarContainer}>
                      <TouchableOpacity onPress={() => handleUserPress(otherUser.id)}>
                        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
                      </TouchableOpacity>
                      {conversation.unreadCount > 0 && (
                        <View style={styles.onlineIndicator} />
                      )}
                    </View>
                    
                    <View style={styles.conversationInfo}>
                      <View style={styles.conversationHeader}>
                        <TouchableOpacity onPress={() => handleUserPress(otherUser.id)}>
                          <Text style={styles.username}>{otherUser.username}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timestamp}>{conversation.lastMessage.timestamp}</Text>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {conversation.lastMessage.content}
                      </Text>
                    </View>
                    
                    {conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <MessageCircle size={64} color="#a855f7" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation with someone!</Text>
              <TouchableOpacity style={styles.startChatButton} onPress={handleNewMessage}>
                <LinearGradient
                  colors={['#e0aaff', '#c77dff', '#9d4edd']}
                  style={styles.startChatGradient}
                >
                  <Edit size={16} color="#ffffff" />
                  <Text style={styles.startChatText}>Start New Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#121212',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  newMessageButton: {
    padding: 8,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B61E5',
    backgroundColor: '#121212',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#9B61E5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D46A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#A0A0A0',
    opacity: 0.8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  unreadBadge: {
    backgroundColor: '#9B61E5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 30,
  },
  startChatButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});