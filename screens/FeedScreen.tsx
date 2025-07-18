import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import StoryCarousel from '../components/StoryCarousel';
import PostCard from '../components/PostCard';
import { mockPosts, mockStories } from '../data/mockData';
import { Post, Story } from '../types';
import { useUser } from '@/contexts/UserContext';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function FeedScreen() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useUser();
  const [posts, setPosts] = useState<Post[]>(mockPosts || []);
  const [stories, setStories] = useState<Story[]>(mockStories || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  // Show loading state until user data is ready
  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Don't render if no user data
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please log in to continue</Text>
      </View>
    );
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleLike = (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement comment functionality
    } catch (error) {
      console.error('Error handling comment:', error);
    }
  };

  const handleShare = (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement share functionality
    } catch (error) {
      console.error('Error handling share:', error);
    }
  };

  const handleAddStory = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Implement add story functionality
    } catch (error) {
      console.error('Error handling add story:', error);
    }
  };

  const handleStoryPress = (story: Story) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Implement story view functionality
    } catch (error) {
      console.error('Error handling story press:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error during refresh:', error);
      setIsRefreshing(false);
    }
  };

  const renderHeader = () => (
    <StoryCarousel
      stories={stories}
      currentUser={currentUser}
      onAddStory={handleAddStory}
      onStoryPress={handleStoryPress}
    />
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    if (!item) return null;
    
    return (
      <Animated.View
        entering={withSpring}
        style={styles.postWrapper}
      >
        <PostCard
          post={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </Animated.View>
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1E1E1E" />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <Header />
        </Animated.View>
        
        <AnimatedFlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          style={styles.flatList}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6C5CE7"
              progressBackgroundColor="#1E1E1E"
              colors={['#6C5CE7']}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 100,
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
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
    marginTop: 12,
  },
  postWrapper: {
    marginBottom: 8,
  },
});