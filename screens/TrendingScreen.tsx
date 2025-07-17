import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Flame, Filter, Heart, MessageCircle, X, Play, Eye } from 'lucide-react-native';
import { mockPosts } from '../data/mockData';
import { Post } from '../types';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 48) / 3; // 3 columns with 16px spacing

const genres = [
  'All', 'Fitness', 'Music', 'Coding', 'AI', 'Crypto', 
  'Gaming', 'Film', 'Comedy', 'Fashion', 'Art', 'Travel'
];

const contentTypes = ['All', 'Image', 'Reel', 'Video', 'AI-generated'];
const dateFilters = ['Today', 'Week', 'Month', 'All Time'];
const regions = ['Global', 'Local', 'North America', 'Europe', 'Asia'];
const trendingStyles = ['Likes', 'Shares', 'Velocity', 'Comments'];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TrendingPost extends Post {
  viewCount: number;
  isVideo: boolean;
  duration?: string;
}

const mockTrendingPosts: TrendingPost[] = [
  ...mockPosts.map((post, index) => ({
    ...post,
    viewCount: Math.floor(Math.random() * 50000) + 1000,
    isVideo: index % 3 === 0,
    duration: index % 3 === 0 ? `${Math.floor(Math.random() * 60) + 15}s` : undefined,
  })),
  // Add more posts for variety
  {
    id: 'trending-1',
    user: {
      id: 'creator-1',
      username: 'cosmic_artist',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Digital creator',
      location: 'New York',
      age: 26,
      isHost: true,
    },
    content: 'Amazing cosmic art creation process 🌌',
    image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    likes: 15420,
    comments: 234,
    isLiked: false,
    isTrending: true,
    timestamp: '3h ago',
    viewCount: 25600,
    isVideo: true,
    duration: '45s',
  },
  {
    id: 'trending-2',
    user: {
      id: 'creator-2',
      username: 'neon_dreamer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Neon artist',
      location: 'LA',
      age: 24,
      isHost: false,
    },
    content: 'Cyberpunk neon vibes ⚡',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    likes: 8930,
    comments: 156,
    isLiked: true,
    isTrending: true,
    timestamp: '1h ago',
    viewCount: 42300,
    isVideo: false,
  },
];

export default function TrendingScreen() {
  const router = useRouter();
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>(mockTrendingPosts);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    contentType: 'All',
    date: 'Today',
    region: 'Global',
    trendingStyle: 'Likes',
  });

  const fireGlow = useSharedValue(0);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    fireGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const fireAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(fireGlow.value, [0, 1], [0.3, 0.8]),
      shadowRadius: interpolate(fireGlow.value, [0, 1], [6, 15]),
    };
  });

  const handleLike = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrendingPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 1000);
  }, []);

  const handleGenreSelect = useCallback((genre: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGenre(genre);
    // Filter posts based on genre
  }, []);

  const handleFilterApply = useCallback(() => {
    setShowFilterModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Apply filters
  }, []);

  // Masonry-style layout calculation
  const getItemHeight = (index: number) => {
    const heights = [TILE_SIZE * 1.3, TILE_SIZE, TILE_SIZE * 1.5];
    return heights[index % heights.length];
  };

  const PostTile = React.memo(({ post, index }: { post: TrendingPost; index: number }) => {
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.95);
      glow.value = withTiming(1, { duration: 200 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
      glow.value = withTiming(0, { duration: 200 });
    };

    const handlePress = () => {
      router.push({
        pathname: '/ProfileScreen',
        params: { userId: post.user.id }
      });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: interpolate(glow.value, [0, 1], [0.1, 0.4]),
      shadowRadius: interpolate(glow.value, [0, 1], [4, 12]),
    }));

    const tileHeight = getItemHeight(index);

    return (
      <AnimatedTouchableOpacity
        style={[styles.postTile, { height: tileHeight }, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.postImageContainer}>
          <Image source={{ uri: post.image }} style={styles.postImage} />
          
          {/* Video indicator */}
          {post.isVideo && (
            <View style={styles.videoIndicator}>
              <Play size={12} color="#F5F5F5" fill="#F5F5F5" />
              <Text style={styles.videoDuration}>{post.duration}</Text>
            </View>
          )}

          {/* Trending badge */}
          {post.isTrending && (
            <Animated.View style={[styles.trendingBadge, fireAnimatedStyle]}>
              <Flame size={10} color="#F5F5F5" fill="#F5F5F5" />
            </Animated.View>
          )}

          {/* Like indicator */}
          {post.isLiked && (
            <View style={styles.likeIndicator}>
              <Heart size={12} color="#E74C3C" fill="#E74C3C" />
            </View>
          )}
        </View>

        <View style={styles.postInfo}>
          <Text style={styles.creatorHandle} numberOfLines={1}>
            @{post.user.username}
          </Text>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Eye size={10} color="#B0B0B0" />
              <Text style={styles.statText}>{formatNumber(post.viewCount)}</Text>
            </View>
            <View style={styles.statItem}>
              <Heart size={10} color="#B0B0B0" />
              <Text style={styles.statText}>{formatNumber(post.likes)}</Text>
            </View>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderGenreFilter = ({ item }: { item: string }) => {
    const isSelected = item === selectedGenre;
    return (
      <TouchableOpacity
        style={[styles.genreChip, isSelected && styles.selectedGenreChip]}
        onPress={() => handleGenreSelect(item)}
      >
        <Text style={[styles.genreText, isSelected && styles.selectedGenreText]}>
          {item}
        </Text>
        {isSelected && <View style={styles.genreGlow} />}
      </TouchableOpacity>
    );
  };

  const renderPost = ({ item, index }: { item: TrendingPost; index: number }) => (
    <PostTile post={item} index={index} />
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1E1E', '#2A2A2A', '#1E1E1E']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Heart size={24} color="#E74C3C" fill="#E74C3C" />
            <Text style={[styles.logoText, { fontFamily: 'Inter_700Bold' }]}>
              The Club
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => setShowFilterModal(true)} 
            style={styles.filterButton}
          >
            <Filter size={22} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Hot Right Now Section */}
        <View style={styles.hotSection}>
          <View style={styles.hotHeader}>
            <Animated.View style={[styles.fireIconContainer, fireAnimatedStyle]}>
              <Flame size={16} color="#7A4FE2" fill="#7A4FE2" />
            </Animated.View>
            <Text style={[styles.hotTitle, { fontFamily: 'Inter_600SemiBold' }]}>
              Hot Right Now
            </Text>
          </View>
          <Text style={[styles.hotSubtitle, { fontFamily: 'Inter_400Regular' }]}>
            Trending Algorithm Updated Every 5 Minutes
          </Text>
        </View>

        {/* Genre Filters */}
        <View style={styles.genreSection}>
          <FlatList
            data={genres}
            renderItem={renderGenreFilter}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
          />
        </View>

        {/* Posts Grid */}
        <FlatList
          data={trendingPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7A4FE2"
              progressBackgroundColor="#2A2A2A"
            />
          }
        />

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                  Filters
                </Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <X size={24} color="#B0B0B0" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Content Type */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { fontFamily: 'Inter_500Medium' }]}>
                    Content Type
                  </Text>
                  <View style={styles.filterOptions}>
                    {contentTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterOption,
                          filters.contentType === type && styles.selectedFilterOption
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, contentType: type }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.contentType === type && styles.selectedFilterOptionText
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date Range */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { fontFamily: 'Inter_500Medium' }]}>
                    Date Range
                  </Text>
                  <View style={styles.filterOptions}>
                    {dateFilters.map((date) => (
                      <TouchableOpacity
                        key={date}
                        style={[
                          styles.filterOption,
                          filters.date === date && styles.selectedFilterOption
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, date }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.date === date && styles.selectedFilterOptionText
                        ]}>
                          {date}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Region */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { fontFamily: 'Inter_500Medium' }]}>
                    Region
                  </Text>
                  <View style={styles.filterOptions}>
                    {regions.map((region) => (
                      <TouchableOpacity
                        key={region}
                        style={[
                          styles.filterOption,
                          filters.region === region && styles.selectedFilterOption
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, region }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.region === region && styles.selectedFilterOptionText
                        ]}>
                          {region}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Trending Style */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { fontFamily: 'Inter_500Medium' }]}>
                    Trending Style
                  </Text>
                  <View style={styles.filterOptions}>
                    {trendingStyles.map((style) => (
                      <TouchableOpacity
                        key={style}
                        style={[
                          styles.filterOption,
                          filters.trendingStyle === style && styles.selectedFilterOption
                        ]}
                        onPress={() => setFilters(prev => ({ ...prev, trendingStyle: style }))}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.trendingStyle === style && styles.selectedFilterOptionText
                        ]}>
                          {style}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.applyButton} onPress={handleFilterApply}>
                <LinearGradient
                  colors={['#7A4FE2', '#6B3FCF']}
                  style={styles.applyButtonGradient}
                >
                  <Text style={[styles.applyButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                    Apply Filters
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#F5F5F5',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  hotSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  hotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fireIconContainer: {
    marginRight: 8,
    shadowColor: '#7A4FE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  hotTitle: {
    fontSize: 18,
    color: '#F5F5F5',
    fontWeight: '600',
  },
  hotSubtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '400',
  },
  genreSection: {
    marginBottom: 16,
  },
  genreList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    position: 'relative',
  },
  selectedGenreChip: {
    backgroundColor: '#7A4FE2',
    borderColor: '#7A4FE2',
  },
  genreText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedGenreText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
  genreGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#7A4FE2',
    borderRadius: 22,
    opacity: 0.3,
    zIndex: -1,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postTile: {
    width: TILE_SIZE,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postImageContainer: {
    position: 'relative',
    flex: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  videoDuration: {
    color: '#F5F5F5',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#7A4FE2',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A4FE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  likeIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postInfo: {
    padding: 12,
  },
  creatorHandle: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#B0B0B0',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  modalTitle: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterLabel: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  selectedFilterOption: {
    backgroundColor: '#7A4FE2',
    borderColor: '#7A4FE2',
  },
  filterOptionText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFilterOptionText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
  applyButton: {
    margin: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
});