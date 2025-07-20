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
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Share2, Settings, Grid2x2 as Grid, Camera, UserPlus, UserMinus, MessageCircle, Crown, DollarSign, Shield, MapPin, Clock, CreditCard as Edit3, Chrome as Home, TrendingUp, ArrowRight, ArrowLeft, Flag, Bell, Heart, UserCheck, Clock3, X, ChevronLeft, ChevronRight, Trophy, Upload, Users, Award } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import { mockUsers, mockPosts } from '../data/mockData';
import { Post, User } from '../types';
import FullScreenPostViewer from '../components/FullScreenPostViewer';
import BulletinBoardSection from '../components/BulletinBoardSection';
import { useUser } from '@/contexts/UserContext';

const { width, height } = Dimensions.get('window');
const imageSize = (width - 56) / 3;
const HEADER_HEIGHT = 100;
const PROFILE_IMAGE_SIZE = 120;

interface ProfileScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export default function ProfileScreen({ route }: ProfileScreenProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
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
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [showFullScreenPost, setShowFullScreenPost] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [coverImage, setCoverImage] = useState('https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800');

  // Animation values
  const scrollY = useSharedValue(0);
  const profileGlow = useSharedValue(0);
  const buttonPulse = useSharedValue(0);
  const coverFade = useSharedValue(1);
  const notificationBounce = useSharedValue(0);
  const hostButtonScale = useSharedValue(1);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    // Subtle glow animation for premium users
    if (user.isHost) {
      profileGlow.value = withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        true
      );
    }
    
    // Subtle button pulse
    buttonPulse.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Notification bounce when there are unread notifications
    const unreadCount = 2; // Mock unread count
    if (unreadCount > 0) {
      notificationBounce.value = withRepeat(
        withSpring(1, { damping: 8 }),
        -1,
        true
      );
    }
  }, [user.isHost]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser(prev => ({ ...prev, isFollowing: !isFollowing }));
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would open here');
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

  // Don't render if no user data
  if (!user || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 150, 300],
      [0, 0.7, 1],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  const profileImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 200, 400],
      [1, 0.75, 0.5],
      'clamp'
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 200, 400],
      [0, -30, -60],
      'clamp'
    );
    
    const glowOpacity = user.isHost ? interpolate(profileGlow.value, [0, 1], [0.3, 0.7]) : 0;
    
    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity: glowOpacity,
      shadowRadius: interpolate(profileGlow.value, [0, 1], [10, 20]),
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(buttonPulse.value, [0, 1], [1, 1.01]) }
      ],
      shadowOpacity: interpolate(buttonPulse.value, [0, 1], [0.2, 0.4]),
    };
  });

  const coverAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: coverFade.value,
    };
  });

  const miniHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [250, 300],
      [50, 0],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollY.value,
      [250, 300],
      [0, 1],
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const notificationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(notificationBounce.value, [0, 1], [1, 1.1]) }
      ],
    };
  });

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
          colors={['rgba(108, 92, 231, 0.15)', 'rgba(108, 92, 231, 0.05)']}
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
    <View style={styles.container}>
      {/* Charcoal Background */}
      <View style={styles.background} />

      {/* Refined Sticky Mini Header */}
      <Animated.View style={[styles.stickyHeader, headerAnimatedStyle, miniHeaderStyle]}>
        <BlurView intensity={40} style={styles.blurHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.miniHeaderTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            {user?.username || 'Profile'}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleMessages} style={styles.headerIcon}>
              <MessageCircle size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Professional Cover Section */}
        <View style={styles.coverContainer}>
          <Animated.View style={coverAnimatedStyle}>
            <ImageBackground
              source={{ uri: coverImage }}
              style={styles.coverImage}
              blurRadius={1}
            >
              <LinearGradient
                colors={['transparent', 'rgba(30, 30, 30, 0.8)']}
                style={styles.coverGradient}
              />
            </ImageBackground>
          </Animated.View>
        </View>

        {/* Clean Profile Section */}
        <View style={styles.profileSection}>
          {/* Professional Profile Image */}
          <Animated.View style={[styles.profileImageContainer, profileImageAnimatedStyle]}>
            <View style={styles.profileImageWrapper}>
              <Image source={{ uri: user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' }} style={styles.profileImage} />
              {user?.isHost && (
                <View style={styles.crownBadge}>
                  <Crown size={18} color="#6C5CE7" fill="#6C5CE7" />
                </View>
              )}
              {user?.isHost && <View style={styles.premiumGlow} />}
            </View>
          </Animated.View>

          {/* Clean Typography */}
          <View style={styles.userInfo}>
            <Text style={[styles.username, fontsLoaded ? { fontFamily: 'Inter_700Bold' } : {}]}>
              {user?.username ?? 'Guest User'}
            </Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#B0B0B0" />
              <Text style={[styles.locationText, fontsLoaded ? { fontFamily: 'Inter_400Regular' } : {}]}>
                {user?.location ?? 'Unknown Location'}
              </Text>
              <Text style={[styles.ageText, fontsLoaded ? { fontFamily: 'Inter_400Regular' } : {}]}>
                {user?.age ? ` • ${user.age}` : ''}
              </Text>
            </View>
            
            <Text style={[styles.bio, fontsLoaded ? { fontFamily: 'Inter_400Regular' } : {}]}>
              {user?.bio ?? 'No bio available'}
            </Text>
          </View>

          {/* Professional Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statPosts, { fontFamily: 'Inter_700Bold' }]}>
                {userPosts.length}
              </Text>
              <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statFollowers, { fontFamily: 'Inter_700Bold' }]}>
                17.8K
              </Text>
              <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statFollowing, { fontFamily: 'Inter_700Bold' }]}>
                856
              </Text>
              <Text style={[styles.statLabel, { fontFamily: 'Inter_400Regular' }]}>Following</Text>
            </View>
          </View>

          {/* Community Trust Score */}
          {user?.isHost && (
            <View style={styles.trustSection}>
              {renderFlags(4.2)}
              <Text style={[styles.trustLabel, { fontFamily: 'Inter_500Medium' }]}>
                Community Trust Score
              </Text>
            </View>
          )}

          {/* Clean Action Buttons */}
          <View style={styles.actionButtons}>
            {isCurrentUser ? (
              <View>
                <Animated.View style={[styles.editButton, buttonAnimatedStyle]}>
                  <TouchableOpacity onPress={handleEditProfile}>
                    <LinearGradient
                      colors={['#6C5CE7', '#5A4FCF']}
                      style={styles.editButtonGradient}
                    >
                      <Edit3 size={18} color="#FFFFFF" />
                      <Text style={[styles.editButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                        Edit Profile
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                
                {/* Register as Host Button (if not already a host) */}
                {!user?.isHost && (
                  <Animated.View
                    style={[styles.hostButton, hostButtonAnimatedStyle]}
                  >
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
                )}
              </View>
            ) : (
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.followButton, isFollowing && styles.followingButton]} 
                  onPress={handleFollow}
                >
                  <LinearGradient
                    colors={isFollowing ? ['#666666', '#555555'] : ['#6C5CE7', '#5A4FCF']}
                    style={styles.followButtonGradient}
                  >
                    {isFollowing ? (
                      <UserCheck size={18} color="#FFFFFF" />
                    ) : (
                      <UserPlus size={18} color="#FFFFFF" />
                    )}
                    <Text style={[styles.followButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                  <BlurView intensity={30} style={styles.messageButtonBlur}>
                    <MessageCircle size={18} color="#FFFFFF" />
                    <Text style={[styles.messageButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                      Message
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Professional Bulletin Board */}
        <BulletinBoardSection isCurrentUser={isCurrentUser} />

        {/* Clean Posts Grid */}
        <View style={styles.postsSection}>
          <View style={styles.postsHeader}>
            <Grid size={22} color="#FFFFFF" />
            <Text style={[styles.postsHeaderText, { fontFamily: 'Inter_600SemiBold' }]}>
              Posts
            </Text>
          </View>

          {userPosts.length > 0 ? (
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
              <Text style={[styles.emptyText, { fontFamily: 'Inter_600SemiBold' }]}>
                No posts yet
              </Text>
              <Text style={[styles.emptySubtext, { fontFamily: 'Inter_400Regular' }]}>
                {isCurrentUser ? 'Share your creative work' : `${user?.username || 'User'} hasn't posted yet`}
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Full Screen Post Viewer */}
      <FullScreenPostViewer
        visible={showFullScreenPost}
        posts={userPosts}
        initialIndex={selectedPostIndex}
        onClose={() => setShowFullScreenPost(false)}
        onLike={handleLike}
        onComment={handleComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1E1E', // Charcoal background
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
  },
  blurHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#6C5CE7', // Royal Purple
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  notificationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  coverContainer: {
    height: 220,
    marginBottom: -70,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  coverEditButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  coverEditBlur: {
    padding: 14,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 20,
  },
  profileImageContainer: {
    marginBottom: 24,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3A3A3A',
  },
  premiumGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: PROFILE_IMAGE_SIZE + 4,
    height: PROFILE_IMAGE_SIZE + 4,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    opacity: 0.6,
  },
  crownBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#2A2A2A',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#B0B0B0',
    marginLeft: 6,
  },
  ageText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  bio: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statPosts: {
    color: '#6C5CE7', // Royal Purple
  },
  statFollowers: {
    color: '#FFD700', // Gold
  },
  statFollowing: {
    color: '#C0C0C0', // Silver
  },
  statLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
    fontWeight: '400',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  trustLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
  },
  editButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  hostButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  hostButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  followingButton: {
    opacity: 0.8,
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
    borderRadius: 24,
    overflow: 'hidden',
  },
  messageButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  postsSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  postsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  postsGrid: {
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
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
    padding: 12,
  },
  gridPlaceholderText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  likeCountOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  likeCountText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
});