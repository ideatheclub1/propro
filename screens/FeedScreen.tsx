import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Heart, MessageCircle, Share2, Play, TrendingUp } from 'lucide-react-native';
import { mockPosts, mockStories } from '../data/mockData';
import { Post, Story } from '../types';
import { useComments } from '../contexts/CommentContext';
import { useUser } from '@/contexts/UserContext';
import StoryCarousel from '../components/StoryCarousel';
import CommentSystem from '../components/CommentSystem';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Mock shorts data
const mockShorts = [
  {
    id: 's1',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '0:45',
    views: '2.1M',
    title: 'Night City Vibes',
  },
  {
    id: 's2',
    thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '1:12',
    views: '856K',
    title: 'Creative Process',
  },
  {
    id: 's3',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '0:28',
    views: '1.5M',
    title: 'Purple Dreams',
  },
  {
    id: 's4',
    thumbnail: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '0:55',
    views: '923K',
    title: 'Aesthetic Mood',
  },
];

export default function FeedScreen() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { getCommentCount } = useComments();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      
      // Header fade effect
      headerOpacity.value = interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.95],
        'clamp'
      );
    },
  });

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Haptics error:', error);
      }
    }, 1000);
  }, []);

  const handleLike = useCallback((postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }, []);

  const handleComment = useCallback((postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    setSelectedPostId(postId);
    setShowComments(true);
  }, []);

  const handleShare = useCallback((postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    // Share functionality would be implemented here
  }, []);

  const handleStoryPress = useCallback((story: Story) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    // Story viewer would open here
  }, []);

  const handleAddStory = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    router.push('/(tabs)/create');
  }, [router]);

  const handleMessagesPress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    router.push('/(tabs)/messages');
  }, [router]);

  const handleUserPress = useCallback((userId: string) => {
    if (!userId || !currentUser?.id) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    
    if (userId === currentUser.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push({
        pathname: '/ProfileScreen',
        params: { userId }
      });
    }
  }, [router, currentUser?.id]);

  const handleShortsPress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
    router.push('/(tabs)/reels');
  }, [router]);

  // Header component
  const Header = () => {
    const headerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: headerOpacity.value,
    }));

    return (
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Heart size={24} color="#6C5CE7" fill="#6C5CE7" />
            <Text style={styles.logoText}>The Club</Text>
          </View>
          
          <TouchableOpacity onPress={handleMessagesPress} style={styles.messageButton}>
            <MessageCircle size={24} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.messageBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Post component
  const PostItem = ({ post, index }: { post: Post; index: number }) => {
    const likeScale = useSharedValue(1);
    const commentScale = useSharedValue(1);
    const shareScale = useSharedValue(1);
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likes, setLikes] = useState(post.likes);

    const handlePostLike = () => {
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
      
      likeScale.value = withSpring(1.2, {}, () => {
        likeScale.value = withSpring(1);
      });
      
      handleLike(post.id);
    };

    const handlePostComment = () => {
      commentScale.value = withSpring(1.1, {}, () => {
        commentScale.value = withSpring(1);
      });
      handleComment(post.id);
    };

    const handlePostShare = () => {
      shareScale.value = withSpring(1.1, {}, () => {
        shareScale.value = withSpring(1);
      });
      handleShare(post.id);
    };

    const likeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const commentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: commentScale.value }],
    }));

    const shareAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: shareScale.value }],
    }));

    const commentCount = getCommentCount(post.id);

    return (
      <View style={styles.postCard}>
        {/* Post Image */}
        {post.image && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: post.image }} style={styles.postImage} />
            
            {/* Trending Badge */}
            {post.isTrending && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
            
            {/* User Info Overlay */}
            <View style={styles.userOverlay}>
              <TouchableOpacity 
                onPress={() => handleUserPress(post.user.id)} 
                style={styles.userInfo}
              >
                <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
                <View style={styles.userDetails}>
                  <Text style={styles.username}>@{post.user.username}</Text>
                  <Text style={styles.timestamp}>{post.timestamp}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Post Content */}
        <View style={styles.postContent}>
          {/* Actions */}
          <View style={styles.actionsRow}>
            <AnimatedTouchableOpacity
              style={[styles.actionButton, likeAnimatedStyle]}
              onPress={handlePostLike}
            >
              <Heart
                size={24}
                color={isLiked ? '#E74C3C' : '#FFFFFF'}
                fill={isLiked ? '#E74C3C' : 'transparent'}
                strokeWidth={2}
              />
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              style={[styles.actionButton, commentAnimatedStyle]}
              onPress={handlePostComment}
            >
              <MessageCircle size={24} color="#FFFFFF" strokeWidth={2} />
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              style={[styles.actionButton, shareAnimatedStyle]}
              onPress={handlePostShare}
            >
              <Share2 size={24} color="#FFFFFF" strokeWidth={2} />
            </AnimatedTouchableOpacity>
          </View>

          {/* Like Count */}
          <Text style={[styles.likesText, isLiked && styles.likedText]}>
            {likes.toLocaleString()} likes
          </Text>

          {/* Caption */}
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>@{post.user.username}</Text>
              <Text style={styles.captionText}> {post.content}</Text>
            </Text>
          </View>

          {/* Comments */}
          <TouchableOpacity onPress={handlePostComment}>
            <Text style={styles.viewComments}>
              {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment...'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Shorts section component
  const ShortsSection = () => (
    <View style={styles.shortsSection}>
      <View style={styles.shortsHeader}>
        <View style={styles.shortsTitle}>
          <Play size={20} color="#E74C3C" fill="#E74C3C" />
          <Text style={styles.shortsTitleText}>Shorts</Text>
        </View>
        <TouchableOpacity onPress={handleShortsPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shortsScrollContainer}
      >
        {mockShorts.map((short, index) => (
          <TouchableOpacity
            key={short.id}
            style={styles.shortCard}
            onPress={handleShortsPress}
          >
            <Image source={{ uri: short.thumbnail }} style={styles.shortThumbnail} />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
              style={styles.shortGradient}
            >
              <View style={styles.shortInfo}>
                <Text style={styles.shortDuration}>{short.duration}</Text>
                <Text style={styles.shortViews}>{short.views}</Text>
              </View>
            </LinearGradient>
            <View style={styles.playIcon}>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    // Insert shorts section after 2nd post
    if (index === 2) {
      return (
        <View>
          <ShortsSection />
          <PostItem post={item} index={index} />
        </View>
      );
    }
    return <PostItem post={item} index={index} />;
  };

  // Don't render if no user data
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />
      
      <Header />
      
      <AnimatedFlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6C5CE7"
            progressBackgroundColor="#1E1E1E"
          />
        }
        ListHeaderComponent={
          <StoryCarousel
            stories={mockStories}
            onAddStory={handleAddStory}
            onStoryPress={handleStoryPress}
          />
        }
        contentContainerStyle={styles.feedContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />

      {/* Comment System */}
      <CommentSystem
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={selectedPostId}
        postType="feed"
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
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C5CE7',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  messageButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedContent: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: width,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  trendingText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  userOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timestamp: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  postContent: {
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButton: {
    marginRight: 16,
    padding: 8,
  },
  likesText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  likedText: {
    color: '#6C5CE7',
  },
  captionContainer: {
    marginBottom: 8,
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  captionText: {
    color: '#E0E0E0',
    fontWeight: '400',
  },
  viewComments: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  shortsSection: {
    backgroundColor: '#2A2A2A',
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 0,
  },
  shortsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shortsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortsTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  shortsScrollContainer: {
    paddingRight: 16,
  },
  shortCard: {
    width: 150,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  shortThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shortGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  shortInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  shortDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shortViews: {
    fontSize: 11,
    color: '#E0E0E0',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});