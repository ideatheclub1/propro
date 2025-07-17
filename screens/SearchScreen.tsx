import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Filter, MessageCircle, MapPin, Star, Heart, Search, X, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width > 400 ? (width - 64) / 2 : width - 32;

interface User {
  id: string;
  name: string;
  age: number;
  rating: number;
  location: string;
  hourlyRate: number;
  profileImage: string;
  tags: string[];
  role: string;
  gender: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 28,
    rating: 4.8,
    location: 'Los Angeles, CA',
    hourlyRate: 45,
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Relationship Advice', 'Therapist'],
    role: 'Girlfriend',
    gender: 'Female'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 32,
    rating: 4.9,
    location: 'San Francisco, CA',
    hourlyRate: 60,
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Life Coach', 'Mentor'],
    role: 'Friend',
    gender: 'Male'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    age: 26,
    rating: 4.7,
    location: 'New York, NY',
    hourlyRate: 40,
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Listener', 'Support'],
    role: 'Listener',
    gender: 'Female'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    age: 35,
    rating: 4.6,
    location: 'Chicago, IL',
    hourlyRate: 55,
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Career Advice', 'Father Figure'],
    role: 'Father',
    gender: 'Male'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    age: 30,
    rating: 4.8,
    location: 'Miami, FL',
    hourlyRate: 50,
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Emotional Support', 'Mother Figure'],
    role: 'Mother',
    gender: 'Female'
  },
  {
    id: '6',
    name: 'Alex Kim',
    age: 29,
    rating: 4.5,
    location: 'Seattle, WA',
    hourlyRate: 42,
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Gaming', 'Tech Support'],
    role: 'Boyfriend',
    gender: 'Male'
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalHosts, setShowLocalHosts] = useState(false);
  
  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

  const handleNotificationPress = () => {
    // Handle notification press
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        color={index < Math.floor(rating) ? '#FFD700' : '#4A4A4A'}
        fill={index < Math.floor(rating) ? '#FFD700' : 'transparent'}
      />
    ));
  };

  const UserCard = ({ user, index }: { user: User; index: number }) => {
    const scale = useSharedValue(1);
    const shadowOpacity = useSharedValue(0.2);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.96);
      shadowOpacity.value = withTiming(0.4);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
      shadowOpacity.value = withTiming(0.2);
    };

    const handlePress = () => {
      router.push({
        pathname: '/ProfileScreen',
        params: { userId: user.id }
      });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: shadowOpacity.value,
    }));

    return (
      <AnimatedTouchableOpacity
        style={[styles.userCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <BlurView intensity={20} style={styles.cardBlur}>
          <LinearGradient
            colors={['rgba(42, 42, 42, 0.95)', 'rgba(58, 58, 58, 0.85)']}
            style={styles.cardGradient}
          >
            {/* Profile Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              <View style={styles.onlineIndicator} />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { fontFamily: 'Inter_700Bold' }]} numberOfLines={1}>
                {user.name}
              </Text>
              
              <View style={styles.locationRow}>
                <MapPin size={14} color="#B0B0B0" />
                <Text style={[styles.locationText, { fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
                  {user.location}
                </Text>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {user.tags.slice(0, 2).map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={[styles.tagText, { fontFamily: 'Inter_500Medium' }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <View style={styles.starsRow}>
                  {renderStars(user.rating)}
                </View>
                <Text style={[styles.ratingText, { fontFamily: 'Inter_500Medium' }]}>
                  {user.rating}
                </Text>
              </View>

              {/* Price */}
              <Text style={[styles.priceText, { fontFamily: 'Inter_600SemiBold' }]}>
                ${user.hourlyRate}/hr
              </Text>
            </View>
          </LinearGradient>
        </BlurView>
      </AnimatedTouchableOpacity>
    );
  };

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
          
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              onPress={handleNotificationPress} 
              style={styles.iconButton}
            >
              <Bell size={22} color="#B0B0B0" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleMessagesPress} 
              style={styles.iconButton}
            >
              <MessageCircle size={22} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#B0B0B0" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { fontFamily: 'Inter_400Regular' }]}
                placeholder="Search by name, skills, or interests..."
                placeholderTextColor="#B0B0B0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color="#B0B0B0" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Row */}
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={18} color="#7A4FE2" />
                <Text style={[styles.filterText, { fontFamily: 'Inter_500Medium' }]}>
                  Filters
                </Text>
              </TouchableOpacity>
              
              <View style={styles.localHostToggle}>
                <Text style={[styles.toggleText, { fontFamily: 'Inter_500Medium' }]}>
                  Local Hosts
                </Text>
                <Switch
                  value={showLocalHosts}
                  onValueChange={setShowLocalHosts}
                  trackColor={{ false: '#3A3A3A', true: '#7A4FE2' }}
                  thumbColor={showLocalHosts ? '#F5F5F5' : '#B0B0B0'}
                  ios_backgroundColor="#3A3A3A"
                />
              </View>
            </View>
          </View>

          {/* Users Grid */}
          <View style={styles.usersSection}>
            <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
              Discover People ({filteredUsers.length})
            </Text>
            
            <View style={styles.usersGrid}>
              {filteredUsers.map((user, index) => (
                <UserCard key={user.id} user={user} index={index} />
              ))}
            </View>
          </View>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#7A4FE2',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#F5F5F5',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  filterText: {
    color: '#7A4FE2',
    fontSize: 14,
    marginLeft: 8,
  },
  localHostToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  usersSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#F5F5F5',
    marginBottom: 20,
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: width > 400 ? 'space-between' : 'center',
  },
  userCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    padding: 20,
    minHeight: 240,
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#7A4FE2',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D46A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 18,
    color: '#F5F5F5',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(122, 79, 226, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 79, 226, 0.4)',
  },
  tagText: {
    fontSize: 12,
    color: '#7A4FE2',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  priceText: {
    fontSize: 18,
    color: '#F5F5F5',
    textAlign: 'center',
  },
});