import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Heart, MessageCircle, Share2, Bookmark, Music, MoveHorizontal as MoreHorizontal, Volume2, VolumeX, Play, Pause } from 'lucide-react-native';
import { Reel } from '../data/mockReels';
import { useComments } from '../contexts/CommentContext';
import CommentSystem from './CommentSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  onLike: (reelId: string) => void;
  onSave: (reelId: string) => void;
  onComment: (reelId: string) => void;
  onShare: (reelId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ReelItem({
  reel,
  isActive,
  onLike,
  onSave,
  onComment,
  onShare,
}: ReelItemProps) {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [isSaved, setIsSaved] = useState(reel.isSaved);
  const [likes, setLikes] = useState(reel.likes);
  const [showComments, setShowComments] = useState(false);
  const { getCommentCount } = useComments();

  // Animation values
  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(isLiked ? 1 : 0.8);
  const saveScale = useSharedValue(1);
  const heartExplosion = useSharedValue(0);
  const musicRotation = useSharedValue(0);
  const volumeSliderOpacity = useSharedValue(0);
  const volumeSliderTranslateY = useSharedValue(50);
  const playButtonOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      videoRef.current?.playAsync();
      // Start music rotation animation
      musicRotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
    } else {
      setIsPlaying(false);
      videoRef.current?.pauseAsync();
    }
  }, [isActive]);

  const handleUserPress = () => {
    if (reel.user.id === '1') {
      Alert.alert(
        'Your Profile',
        'You are viewing your own profile.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') }
        ]
      );
    } else {
      router.push({
        pathname: '/ProfileScreen',
        params: { userId: reel.user.id }
      });
    }
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    
    likeScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    likeOpacity.value = withTiming(isLiked ? 0.8 : 1, { duration: 200 });
    
    onLike(reel.id);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
      
      // Heart explosion animation
      heartExplosion.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setIsSaved(!isSaved);
    saveScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    onSave(reel.id);
  };

  const handleCommentPress = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
      playButtonOpacity.value = withTiming(1, { duration: 200 });
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
      playButtonOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const showVolumeSlider = () => {
    volumeSliderOpacity.value = withTiming(1, { duration: 200 });
    volumeSliderTranslateY.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      volumeSliderOpacity.value = withTiming(0, { duration: 200 });
      volumeSliderTranslateY.value = withTiming(50, { duration: 200 });
    }, 2000);
  };

  // Double tap gesture
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(handleDoubleTap)();
    });

  // Single tap gesture
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      runOnJS(handlePlayPause)();
    });

  const tapGesture = Gesture.Exclusive(doubleTapGesture, singleTapGesture);

  // Animated styles
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
    opacity: likeOpacity.value,
  }));

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const heartExplosionStyle = useAnimatedStyle(() => ({
    opacity: heartExplosion.value,
    transform: [
      { scale: interpolate(heartExplosion.value, [0, 1], [0.5, 2]) },
    ],
  }));

  const musicRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${musicRotation.value}deg` }],
  }));

  const volumeSliderStyle = useAnimatedStyle(() => ({
    opacity: volumeSliderOpacity.value,
    transform: [{ translateY: volumeSliderTranslateY.value }],
  }));

  const playButtonStyle = useAnimatedStyle(() => ({
    opacity: playButtonOpacity.value,
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const commentCount = getCommentCount(reel.id);

  return (
    <>
      <View style={styles.container}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: reel.videoUrl }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isActive && isPlaying}
              isLooping
              isMuted={isMuted}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setIsLoading(false);
                  if (status.durationMillis) {
                    setProgress(status.positionMillis! / status.durationMillis);
                  }
                }
              }}
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
              </View>
            )}
            
            {/* Play button overlay */}
            <Animated.View style={[styles.playButtonOverlay, playButtonStyle]}>
              <View style={styles.playButton}>
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </Animated.View>
            
            {/* Heart explosion */}
            <Animated.View style={[styles.heartExplosion, heartExplosionStyle]}>
              <Heart size={80} color="#ff6b9d" fill="#ff6b9d" />
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        {/* Top overlay */}
        <View style={styles.topOverlay}>
          <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
            <Image source={{ uri: reel.user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{reel.user.username}</Text>
              <Text style={styles.timestamp}>{reel.timestamp}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.volumeButton} onPress={handleVolumeToggle}>
              {isMuted ? (
                <VolumeX size={24} color="#FFFFFF" />
              ) : (
                <Volume2 size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Volume slider */}
        <Animated.View style={[styles.volumeSlider, volumeSliderStyle]}>
          <View style={styles.volumeTrack}>
            <View style={[styles.volumeFill, { height: '70%' }]} />
          </View>
        </Animated.View>

        {/* Right side actions */}
        <View style={styles.rightActions}>
          <AnimatedTouchableOpacity
            style={[styles.actionButton, likeAnimatedStyle]}
            onPress={handleLike}
          >
            <Heart
              size={28}
              color={isLiked ? '#ff6b9d' : '#FFFFFF'}
              fill={isLiked ? '#ff6b9d' : 'transparent'}
            />
            <Text style={styles.actionText}>{formatNumber(likes)}</Text>
          </AnimatedTouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCommentPress}
          >
            <MessageCircle size={28} color="#FFFFFF" />
            <Text style={styles.actionText}>{formatNumber(commentCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(reel.id)}
          >
            <Share2 size={28} color="#FFFFFF" />
            <Text style={styles.actionText}>{formatNumber(reel.shares)}</Text>
          </TouchableOpacity>

          <AnimatedTouchableOpacity
            style={[styles.actionButton, saveAnimatedStyle]}
            onPress={handleSave}
          >
            <Bookmark
              size={28}
              color={isSaved ? '#9B61E5' : '#FFFFFF'}
              fill={isSaved ? '#9B61E5' : 'transparent'}
            />
          </AnimatedTouchableOpacity>

          {/* Music info */}
          {reel.musicInfo && (
            <TouchableOpacity style={styles.musicButton}>
              <Animated.View style={[styles.musicIcon, musicRotationStyle]}>
                <Music size={24} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>{reel.user.username}</Text>
              {' '}
              {reel.caption}
            </Text>
            
            {/* Hashtags */}
            <View style={styles.hashtagContainer}>
              {reel.hashtags.map((hashtag, index) => (
                <TouchableOpacity key={index} style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{hashtag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Music info */}
          {reel.musicInfo && (
            <View style={styles.musicInfo}>
              <Music size={16} color="#FFFFFF" />
              <Text style={styles.musicText} numberOfLines={1}>
                {reel.musicInfo.title} • {reel.musicInfo.artist}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Comment System */}
      <CommentSystem
        visible={showComments}
        onClose={handleCloseComments}
        postId={reel.id}
        postType="reel"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#9B61E5',
    borderTopColor: 'transparent',
    // Add rotation animation here if needed
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartExplosion: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9B61E5',
  },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#9B61E5',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeSlider: {
    position: 'absolute',
    right: 80,
    top: 100,
    width: 30,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  volumeTrack: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    position: 'relative',
  },
  volumeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#9B61E5',
    borderRadius: 10,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 150,
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  musicButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9B61E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 80,
    paddingHorizontal: 16,
  },
  captionContainer: {
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  hashtag: {
    backgroundColor: 'rgba(155, 97, 229, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 12,
    color: '#9B61E5',
    fontWeight: '600',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '80%',
  },
  musicText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
});