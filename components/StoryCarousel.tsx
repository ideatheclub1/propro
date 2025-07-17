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
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Story, User } from '../types';

interface StoryCarouselProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onStoryPress: (story: Story) => void;
}

export default function StoryCarousel({
  stories,
  currentUser,
  onAddStory,
  onStoryPress,
}: StoryCarouselProps) {
  const router = useRouter();

  const handleUserPress = (userId: string) => {
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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Story Button */}
        <TouchableOpacity style={styles.addStoryContainer} onPress={onAddStory}>
          <View style={styles.addStoryImageContainer}>
            <Image source={{ uri: currentUser.avatar }} style={styles.addStoryImage} />
            <View style={styles.addButton}>
              <Plus size={14} color="#fff" strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.storyUsername}>Your Story</Text>
        </TouchableOpacity>

        {/* Stories */}
        {stories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyContainer}
            onPress={() => onStoryPress(story)}
          >
            <View style={styles.storyImageContainer}>
              <Image source={{ uri: story.user.avatar }} style={styles.storyImage} />
              {!story.viewed && <View style={styles.unviewedIndicator} />}
            </View>
            <TouchableOpacity onPress={() => handleUserPress(story.user.id)}>
              <Text style={styles.storyUsername} numberOfLines={1}>
                {story.user.username}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Bottom divider */}
      <View style={styles.bottomDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
    paddingBottom: 12,
  },
  addStoryContainer: {
    alignItems: 'center',
    width: 64,
  },
  addStoryImageContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  addStoryImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#333',
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  storyContainer: {
    alignItems: 'center',
    width: 64,
  },
  storyImageContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  unviewedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#000000',
  },
  storyUsername: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 64,
    fontWeight: '400',
  },
  bottomDivider: {
    height: 0.5,
    backgroundColor: 'rgba(155, 97, 229, 0.2)',
    marginHorizontal: 0,
  },
});