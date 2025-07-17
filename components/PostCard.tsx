import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Heart, MessageCircle, Share2, MoveHorizontal as MoreHorizontal, TrendingUp } from 'lucide-react-native';
import { Post } from '../types';
import { useComments } from '../contexts/CommentContext';
import CommentSystem from './CommentSystem';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLike, onComment }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const { getCommentCount } = useComments();
  
  const likeScale = useSharedValue(1);
  const trendingGlow = useSharedValue(0);

  React.useEffect(() => {
    if (post.isTrending) {
      trendingGlow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [post.isTrending]);

  const handleLike = () => {
    likeScale.value = withSpring(1.2, {}, () => {
      likeScale.value = withSpring(1);
    });
    
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike(post.id);
  };

  const handleCommentPress = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleUserPress = () => {
    if (post.user.id === '1') {
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
      params: { userId: post.user.id }
    });
  };

  const likeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
    };
  });

  const trendingAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(trendingGlow.value, [0, 1], [0.3, 0.7]),
      shadowRadius: interpolate(trendingGlow.value, [0, 1], [6, 15]),
    };
  });

  const commentCount = getCommentCount(post.id);

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{post.user.username}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerRight}>
            {post.isTrending && (
              <Animated.View style={[styles.trendingBadge, trendingAnimatedStyle]}>
                <TrendingUp size={12} color="#ff6b9d" />
                <Text style={styles.trendingText}>Trending</Text>
              </Animated.View>
            )}
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image */}
        {post.image && (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Animated.View style={likeAnimatedStyle}>
                <Heart
                  size={22}
                  color={isLiked ? '#ff6b9d' : '#ffffff'}
                  fill={isLiked ? '#ff6b9d' : 'transparent'}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCommentPress}
            >
              <MessageCircle size={22} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Likes */}
        <View style={styles.likesContainer}>
          <Text style={[styles.likesText, isLiked && styles.likedText]}>
            {likes} likes
          </Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.content}>
            <Text style={styles.contentUsername}>{post.user.username}</Text>
            {' '}
            <Text style={styles.contentText}>{post.content}</Text>
          </Text>
        </View>

        {/* Comments */}
        <TouchableOpacity onPress={handleCommentPress}>
          <Text style={styles.viewComments}>
            {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment...'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Comment System */}
      <CommentSystem
        visible={showComments}
        onClose={handleCloseComments}
        postId={post.id}
        postType="feed"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#A0A0A0',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(155, 97, 229, 0.3)',
  },
  trendingText: {
    fontSize: 9,
    color: '#9B61E5',
    fontWeight: '600',
    marginLeft: 3,
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 14,
    padding: 2,
  },
  likesContainer: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  likesText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  likedText: {
    color: '#9B61E5',
  },
  contentContainer: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
  },
  contentUsername: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentText: {
    color: '#FFFFFF',
  },
  viewComments: {
    fontSize: 13,
    color: '#A0A0A0',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});