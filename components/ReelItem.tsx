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
  ScrollView,
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
import { Heart, MessageCircle, Share2, Bookmark, Music, Volume2, VolumeX, Play, Pause, Clock } from 'lucide-react-native';
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
  const [showMusicInfo, setShowMusicInfo] = useState(false);
  const { getCommentCount } = useComments();

  // Animation values
  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(isLiked ? 1 : 0.8);
  const saveScale = useSharedValue(1);
  const heartExplosion = useSharedValue(0);
  const musicRotation = useSharedValue(0);
  const playButtonOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      videoRef.current?.playAsync();
      // Start music rotation animation
      if (reel.musicInfo) {
        musicRotation.value = withRepeat(
          withTiming(360, { duration: 3000 }),
          -1,
          false
        );
      }
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
      withSpring(1.3, { damping: 8, stiffness: 200 }),
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
      withSpring(1.3, { damping: 8, stiffness: 200 }),
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

  const handleMusicPress = () => {
    setShowMusicInfo(true);
    setTimeout(() => setShowMusicInfo(false), 3000);
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
      { scale: interpolate(heartExplosion.value, [0, 1], [0.5, 2.5]) },
    ],
  }));

  const musicRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${musicRotation.value}deg` }],
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
                <Play size={32} color="#EAEAEA" fill="#EAEAEA" />
              </View>
            </Animated.View>
            
            {/* Heart explosion */}
            <Animated.View style={[styles.heartExplosion, heartExplosionStyle]}>
              <Heart size={80} color="#E74C3C" fill="#E74C3C" />
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        {/* Top overlay - Sound toggle */}
        <View style={styles.topOverlay}>
          <TouchableOpacity style={styles.volumeButton} onPress={handleVolumeToggle}>
            {isMuted ? (
              <VolumeX size={24} color="#EAEAEA" />
            ) : (
              <Volume2 size={24} color="#EAEAEA" />
            )}
          </TouchableOpacity>
        </View>

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Clock size={12} color="#EAEAEA" />
          <Text style={styles.durationText}>{reel.duration}</Text>
        </View>

        {/* Right side actions */}
        <View style={styles.rightActions}>
          <AnimatedTouchableOpacity
            style={[styles.actionButton, likeAnimatedStyle]}
            onPress={handleLike}
          >
            <View style={styles.actionIconContainer}>
              <Heart
                size={32}
                color={isLiked ? '#E74C3C' : '#EAEAEA'}
                fill={isLiked ? '#E74C3C' : 'transparent'}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.actionText}>{formatNumber(likes)}</Text>
          </AnimatedTouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCommentPress}
          >
            <View style={styles.actionIconContainer}>
              <MessageCircle size={32} color="#EAEAEA" strokeWidth={1.5} />
            </View>
            <Text style={styles.actionText}>{formatNumber(commentCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(reel.id)}
          >
            <View style={styles.actionIconContainer}>
              <Share2 size={32} color="#EAEAEA" strokeWidth={1.5} />
            </View>
            <Text style={styles.actionText}>{formatNumber(reel.shares)}</Text>
          </TouchableOpacity>

          <AnimatedTouchableOpacity
            style={[styles.actionButton, saveAnimatedStyle]}
            onPress={handleSave}
          >
            <View style={styles.actionIconContainer}>
              <Bookmark
                size={32}
                color={isSaved ? '#6C5CE7' : '#EAEAEA'}
                fill={isSaved ? '#6C5CE7' : 'transparent'}
                strokeWidth={1.5}
              />
            </View>
          </AnimatedTouchableOpacity>

          {/* Music info */}
          {reel.musicInfo && (
            <TouchableOpacity style={styles.musicButton} onPress={handleMusicPress}>
              <Animated.View style={[styles.musicIcon, musicRotationStyle]}>
                <Music size={20} color="#EAEAEA" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom overlay - User info and caption */}
        <View style={styles.bottomOverlay}>
          <LinearGradient
            colors={['transparent', 'rgba(30, 30, 30, 0.8)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.bottomGradient}
          >
            {/* User info */}
            <View style={styles.userInfoContainer}>
              <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
                <Image source={{ uri: reel.user.avatar }} style={styles.avatar} />
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{reel.user.username}</Text>
                  <Text style={styles.timestamp}>{reel.timestamp}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <View style={styles.captionContainer}>
              <Text style={styles.caption} numberOfLines={3}>
                {reel.caption}
              </Text>
              
              {/* Hashtags */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.hashtagScroll}
                contentContainerStyle={styles.hashtagContainer}
              >
                {reel.hashtags.map((hashtag, index) => (
                  <TouchableOpacity key={index} style={styles.hashtag}>
                    <Text style={styles.hashtagText}>{hashtag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Music info overlay */}
            {showMusicInfo && reel.musicInfo && (
              <View style={styles.musicInfoOverlay}>
                <Music size={16} color="#EAEAEA" />
                <Text style={styles.musicText} numberOfLines={1}>
                  {reel.musicInfo.title} • {reel.musicInfo.artist}
                </Text>
              </View>
            )}
          </LinearGradient>
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
    backgroundColor: '#1E1E1E',
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
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#6C5CE7',
    borderTopColor: 'transparent',
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
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heartExplosion: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(234, 234, 234, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C5CE7',
  },
  topOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  durationBadge: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  durationText: {
    color: '#EAEAEA',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rightActions: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#EAEAEA',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicButton: {
    marginTop: 12,
  },
  musicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 92, 231, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  userInfoContainer: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
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
    fontWeight: 'bold',
    color: '#EAEAEA',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captionContainer: {
    maxWidth: '75%',
  },
  caption: {
    fontSize: 14,
    color: '#EAEAEA',
    lineHeight: 20,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hashtagScroll: {
    marginTop: 4,
  },
  hashtagContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  hashtag: {
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.4)',
  },
  hashtagText: {
    fontSize: 12,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  musicInfoOverlay: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: 200,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  musicText: {
    fontSize: 12,
    color: '#EAEAEA',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});