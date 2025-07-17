import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Play, RefreshCw } from 'lucide-react-native';
import ReelItem from '../components/ReelItem';
import { mockReels, Reel } from '../data/mockReels';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelsScreen() {
  const [reels, setReels] = useState<Reel[]>(mockReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleLike = useCallback((reelId: string) => {
    setReels(prevReels =>
      prevReels.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            isLiked: !reel.isLiked,
            likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
          };
        }
        return reel;
      })
    );
  }, []);

  const handleSave = useCallback((reelId: string) => {
    setReels(prevReels =>
      prevReels.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            isSaved: !reel.isSaved,
          };
        }
        return reel;
      })
    );
  }, []);

  const handleComment = useCallback((reelId: string) => {
    Alert.alert('Comments', `Opening comments for reel ${reelId}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Comments', onPress: () => console.log('Open comments') },
    ]);
  }, []);

  const handleShare = useCallback((reelId: string) => {
    Alert.alert('Share', `Sharing reel ${reelId}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Share', onPress: () => console.log('Share reel') },
    ]);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('Refreshed', 'New reels loaded!');
    }, 1000);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderReel = ({ item, index }: { item: Reel; index: number }) => (
    <ReelItem
      reel={item}
      isActive={index === currentIndex}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onShare={handleShare}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['rgba(108, 92, 231, 0.1)', 'rgba(108, 92, 231, 0.05)']}
        style={styles.emptyGradient}
      >
        <Play size={64} color="#6C5CE7" />
        <Text style={styles.emptyTitle}>No Reels Available</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to create a reel and share your story!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color="#6C5CE7" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (reels.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#1E1E1E" />
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#1E1E1E" />
      
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6C5CE7"
            progressBackgroundColor="#1E1E1E"
          />
        }
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  flatList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyGradient: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '600',
    marginLeft: 8,
  },
});