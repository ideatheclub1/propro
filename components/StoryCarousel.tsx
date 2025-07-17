import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Story, User } from '../types';

interface StoryCarouselProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onStoryPress: (story: Story) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function StoryCarousel({
  stories,
  currentUser,
  onAddStory,
  onStoryPress,
}: StoryCarouselProps) {
  const router = useRouter();

  const handleUserPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (userId === currentUser.id) {
      Alert.alert(
        'Your Profile',
        'You are viewing your own profile. To make changes, go to your settings.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') }
        ]
      );
      return;
    }
    router.push({
      pathname: '/ProfileScreen',
      params: { userId }
    });
  };

  const StoryItem = ({ story, isAddStory = false }: { story?: Story; isAddStory?: boolean }) => {
    const scale = useSharedValue(1);
    const ringGlow = useSharedValue(0);

    React.useEffect(() => {
      if (!isAddStory) {
        ringGlow.value = withRepeat(
          withTiming(1, { duration: 3000 }),
          -1,
          true
        );
      }
    }, [isAddStory]);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isAddStory) {
        onAddStory();
      } else if (story) {
        onStoryPress(story);
      }
    };

    const storyAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const ringAnimatedStyle = useAnimatedStyle(() => ({
      shadowOpacity: isAddStory ? 0.3 : interpolate(ringGlow.value, [0, 1], [0.4, 0.8]),
      shadowRadius: isAddStory ? 8 : interpolate(ringGlow.value, [0, 1], [8, 16]),
    }));

    if (isAddStory) {
      return (
        <AnimatedTouchableOpacity
          style={[styles.storyContainer, storyAnimatedStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
        >
          <Animated.View style={[styles.addStoryBorder, ringAnimatedStyle]}>
            <View style={styles.addStoryImageContainer}>
              <Image source={{ uri: currentUser.avatar }} style={styles.addStoryImage} />
              <LinearGradient
                colors={['#6C5CE7', '#8B5CF6']}
                style={styles.addButton}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={3} />
              </LinearGradient>
            </View>
          </Animated.View>
          <Text style={styles.storyUsername}>Your Story</Text>
        </AnimatedTouchableOpacity>
      );
    }

    return (
      <AnimatedTouchableOpacity
        style={[styles.storyContainer, storyAnimatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={[styles.storyBorder, ringAnimatedStyle]}>
          <LinearGradient
            colors={['#6C5CE7', '#8B5CF6', '#A855F7']}
            style={styles.storyGradientBorder}
          >
            <View style={styles.storyImageContainer}>
              <Image source={{ uri: story!.user.avatar }} style={styles.storyImage} />
            </View>
          </LinearGradient>
        </Animated.View>
        <TouchableOpacity onPress={() => handleUserPress(story!.user.id)}>
          <Text style={styles.storyUsername} numberOfLines={1}>
            {story!.user.username}
          </Text>
        </TouchableOpacity>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={84}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {/* Add Story Button */}
        <StoryItem isAddStory />

        {/* Stories */}
        {stories.map((story) => (
          <StoryItem key={story.id} story={story} />
        ))}
        
        {/* Spacer for half-visible next item */}
        <View style={styles.spacer} />
      </ScrollView>
      
      {/* Bottom divider */}
      <View style={styles.bottomDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    paddingTop: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 68,
  },
  addStoryBorder: {
    marginBottom: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addStoryImageContainer: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#333333',
    padding: 3,
  },
  addStoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1E1E1E',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  storyBorder: {
    marginBottom: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  storyGradientBorder: {
    padding: 3,
    borderRadius: 37,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  storyImageContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 34,
    padding: 3,
  },
  storyImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  storyUsername: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 68,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  spacer: {
    width: 34, // Half width to show next item
  },
  bottomDivider: {
    height: 0.5,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    marginHorizontal: 20,
    marginTop: 12,
  },
});