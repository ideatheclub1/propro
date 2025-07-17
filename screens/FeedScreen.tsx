import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import StoryCarousel from '../components/StoryCarousel';
import PostCard from '../components/PostCard';
import { mockPosts, mockStories, mockUsers } from '../data/mockData';
import { Post, Story } from '../types';

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [stories, setStories] = useState<Story[]>(mockStories);
  const currentUser = mockUsers[0];

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comments', `Opening comments for post ${postId}`);
  };

  const handleAddStory = () => {
    Alert.alert('Add Story', 'Camera functionality would open here');
  };

  const handleStoryPress = (story: Story) => {
    Alert.alert('Story', `Viewing ${story.user.username}'s story`);
  };

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

  const renderHeader = () => (
    <StoryCarousel
      stories={stories}
      currentUser={currentUser}
      onAddStory={handleAddStory}
      onStoryPress={handleStoryPress}
    />
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
    />
  );

  return (
    <View style={styles.container}>
      <Header onMessagesPress={handleMessagesPress} />
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});