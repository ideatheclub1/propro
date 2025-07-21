import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, MessageCircle, Crown, MapPin, Flag, Grid2x2 as Grid, Play, Bookmark, Heart, ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { mockUsers, mockPosts } from '../data/mockData';
import { Post, User } from '../types';
import FullScreenPostViewer from '../components/FullScreenPostViewer';
import { useUser } from '@/contexts/UserContext';

const { width, height } = Dimensions.get('window');
const imageSize = (width - 56) / 3;
const PROFILE_IMAGE_SIZE = 120;

type MediaTab = 'posts' | 'reels' | 'saved';
interface ProfileScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export default function ProfileScreen({ route }: ProfileScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useUser();
  
  const userId = route?.params?.userId || params?.userId || '1';
  const actualUserId = userId === 'me' ? '1' : userId;
  const isCurrentUser = actualUserId === currentUser?.id;
  
  const [user, setUser] = useState<User>(() => {
    if (isCurrentUser && currentUser) {
      return currentUser;
    }
    const foundUser = mockUsers.find(u => u.id === actualUserId);
    return foundUser || currentUser || mockUsers[0];
  });
  
  const [userPosts, setUserPosts] = useState<Post[]>(
    mockPosts.filter(post => post?.user?.id === actualUserId)
  );
  const [activeTab, setActiveTab] = useState<MediaTab>('posts');
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [showFullScreenPost, setShowFullScreenPost] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

  const hostButtonScale = useSharedValue(1);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser(prev => ({ ...prev, isFollowing: !isFollowing }));
  };

  const handleMessages = () => {
    router.push('/(tabs)/messages');
  };

  const handlePostPress = (post: Post) => {
    const postIndex = userPosts.findIndex(p => p.id === post.id);
    setSelectedPostIndex(postIndex);
    setShowFullScreenPost(true);
  };

  const handleLike = (postId: string) => {
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comment', 'Comment functionality would be implemented here');
  };

  const handleRegisterAsHost = () => {
    hostButtonScale.value = withSpring(0.95, {}, () => {
      hostButtonScale.value = withSpring(1);
    });
    router.push('/host-registration');
  };

  const handleTabPress = (tab: MediaTab) => {
    setActiveTab(tab);
  };

  const handleStatsPress = (type: 'posts' | 'followers' | 'following') => {
    Alert.alert(
      type.charAt(0).toUpperCase() + type.slice(1),
      `Show ${type} list functionality would be implemented here`
    );
  };

  // Don't render if no user data
  if (!user || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hostButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hostButtonScale.value }],
  }));

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, { marginRight: (index + 1) % 3 === 0 ? 0 : 6 }]}
      onPress={() => handlePostPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.gridImage} />
      ) : (
        <LinearGradient
          colors={['rgba(108, 92, 231, 0.2)', 'rgba(108, 92, 231, 0.1)']}
          style={styles.gridPlaceholder}
        >
          <Text style={styles.gridPlaceholderText} numberOfLines={3}>
            {item.content}
          </Text>
        </LinearGradient>
      )}
      
      <View style={styles.likeCountOverlay}>
        <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.likeCountText}>{item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMediaContent = () => {
    switch (activeTab) {
      case 'posts':
        return userPosts.length > 0 ? (
          <FlatList
            data={userPosts}
            renderItem={renderPost}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
            columnWrapperStyle={styles.row}
          />
        ) : (
          <View style={styles.emptyState}>
            <Grid size={48} color="#666666" />
            <Text style={[styles.emptyText, { fontFamily: 'Inter_600SemiBold' }]}>
              No posts yet
            </Text>
            <Text style={[styles.emptySubtext, { fontFamily: 'Inter_400Regular' }]}>
              {isCurrentUser ? 'Share your first post' : `${user?.username || 'User'} hasn't posted yet`}
            </Text>
          </View>
        );
      case 'reels':
        return (
          <View style={styles.emptyState}>
            <Play size={48} color="#666666" />
            <Text style={[styles.emptyText, { fontFamily: 'Inter_600SemiBold' }]}>
              No reels yet
            </Text>
            <Text style={[styles.emptySubtext, { fontFamily: 'Inter_400Regular' }]}>
              {isCurrentUser ? 'Create your first reel' : `${user?.username || 'User'} hasn't shared any reels`}
            </Text>
          </View>
        );
      case 'saved':
        return (
          <View style={styles.emptyState}>
            <Bookmark size={48} color="#666666" />
            <Text style={[styles.emptyText, { fontFamily: 'Inter_600SemiBold' }]}>
              No saved posts
            </Text>
            <Text style={[styles.emptySubtext, { fontFamily: 'Inter_400Regular' }]}>
              {isCurrentUser ? 'Posts you save will appear here' : 'Private collection'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderFlags = (rating: number) => {
    const flagColors = ['#FF4B4B', '#FF914D', '#FFC107', '#A3D977', '#4CAF50'];
    const filledFlags = Math.floor(rating);
    
    return (
      <View style={styles.flagContainer}>
        {Array.from({ length: 5 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.flagIcon,
              {
                backgroundColor: index < filledFlags ? flagColors[index] : '#3A3A3A',
              }
            ]}
          >
            <Flag size={12} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        ))}
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontFamily: 'Inter_700Bold' }]}>
            {isCurrentUser ? 'Profile' : user?.username}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!isCurrentUser && (
            <TouchableOpacity onPress={handleMessages} style={styles.messageIconButton}>
              <MessageCircle size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image 
                source={{ uri: user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' }} 
                style={styles.profileImage} 
              />
              {user?.isHost && (
                <View style={styles.crownBadge}>
                  <Crown size={18} color="#6C5CE7" fill="#6C5CE7" />
                </View>
              )}
              {user?.isHost && <View style={styles.glowRing} />}
            </View>
          </View>

          {/* User Info */}
          <Text style={[styles.username, { fontFamily: 'Inter_700Bold' }]}>
            {user?.username ?? 'Guest User'}
          </Text>
          
          <View style={styles.locationRow}>
            <MapPin size={16} color="#C5C5C5" />
            <Text style={[styles.locationText, { fontFamily: 'Inter_400Regular' }]}>
              {user?.location ?? 'Unknown Location'}
            </Text>
            {user?.age && (
              <Text style={[styles.ageText, { fontFamily: 'Inter_400Regular' }]}>
                • {user.age}
              </Text>
            )}
          </View>
          
          <Text style={[styles.bio, { fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {user?.bio ?? 'No bio available'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statButton} onPress={() => handleStatsPress('posts')}>
            <Text style={[styles.statNumber, { fontFamily: 'Inter_700Bold' }]}>
              {userPosts.length}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Posts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statButton} onPress={() => handleStatsPress('followers')}>
            <Text style={[styles.statNumber, { fontFamily: 'Inter_700Bold' }]}>
              17.8K
            </Text>
            <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Followers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statButton} onPress={() => handleStatsPress('following')}>
            <Text style={[styles.statNumber, { fontFamily: 'Inter_700Bold' }]}>
              856
            </Text>
            <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Score for Hosts */}
        {user?.isHost && (
          <View style={styles.trustSection}>
            {renderFlags(4.2)}
            <Text style={[styles.trustLabel, { fontFamily: 'Inter_500Medium' }]}>
              Community Trust Score
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isCurrentUser ? (
            // Register as Host button for non-hosts
            !user?.isHost && (
              <Animated.View style={[styles.hostButton, hostButtonAnimatedStyle]}>
                <TouchableOpacity onPress={handleRegisterAsHost}>
                  <LinearGradient
                    colors={['#6C5CE7', '#5A4FCF']}
                    style={styles.hostButtonGradient}
                  >
                    <Crown size={18} color="#FFFFFF" />
                    <Text style={[styles.hostButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                      Register as Host
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )
          ) : (
            // Follow/Message buttons for other users
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]} 
                onPress={handleFollow}
              >
                <LinearGradient
                  colors={isFollowing ? ['#666666', '#555555'] : ['#6C5CE7', '#5A4FCF']}
                  style={styles.followButtonGradient}
                >
                  <UserPlus size={18} color="#FFFFFF" />
                  <Text style={[styles.followButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                <MessageCircle size={18} color="#6C5CE7" />
                <Text style={[styles.messageButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Media Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => handleTabPress('posts')}
          >
            <Grid size={20} color={activeTab === 'posts' ? '#6C5CE7' : '#999999'} />
            <Text style={[
              styles.tabText,
              { fontFamily: 'Inter_500Medium' },
              activeTab === 'posts' && styles.activeTabText
            ]}>
              Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
            onPress={() => handleTabPress('reels')}
          >
            <Play size={20} color={activeTab === 'reels' ? '#6C5CE7' : '#999999'} />
            <Text style={[
              styles.tabText,
              { fontFamily: 'Inter_500Medium' },
              activeTab === 'reels' && styles.activeTabText
            ]}>
              Reels
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => handleTabPress('saved')}
          >
            <Bookmark size={20} color={activeTab === 'saved' ? '#6C5CE7' : '#999999'} />
            <Text style={[
              styles.tabText,
              { fontFamily: 'Inter_500Medium' },
              activeTab === 'saved' && styles.activeTabText
            ]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Media Content */}
        <View style={styles.mediaContent}>
          {renderMediaContent()}
        </View>
      </ScrollView>

      {/* Full Screen Post Viewer */}
      <FullScreenPostViewer
        visible={showFullScreenPost}
        posts={userPosts}
        initialIndex={selectedPostIndex}
        onClose={() => setShowFullScreenPost(false)}
        onLike={handleLike}
        onComment={handleComment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  messageIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: 60,
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: PROFILE_IMAGE_SIZE + 8,
    height: PROFILE_IMAGE_SIZE + 8,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#6C5CE7',
    opacity: 0.8,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#C5C5C5',
    marginLeft: 6,
  },
  ageText: {
    fontSize: 15,
    color: '#C5C5C5',
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: '#C5C5C5',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    marginBottom: 24,
  },
  statButton: {
    alignItems: 'center',
    padding: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
  trustSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  flagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  flagIcon: {
    width: 32,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  hostButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  hostButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  hostButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  followButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  messageButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  messageButtonText: {
    color: '#6C5CE7',
    fontWeight: '600',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6C5CE7',
  },
  tabText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#6C5CE7',
  },
  mediaContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postsGrid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333333',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gridPlaceholderText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  likeCountOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  likeCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});