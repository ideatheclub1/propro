import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MessageCircle, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface HeaderProps {
  onMessagesPress?: () => void;
}

export default function Header({ onMessagesPress }: HeaderProps) {
  const router = useRouter();
  const logoGlow = useSharedValue(0);
  const [unreadCount] = useState(2);

  React.useEffect(() => {
    logoGlow.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.3, 0.6]),
      shadowRadius: interpolate(logoGlow.value, [0, 1], [8, 15]),
    };
  });

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.2, 0.5]),
      shadowRadius: interpolate(logoGlow.value, [0, 1], [6, 12]),
    };
  });

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoContent}>
              <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
                <Heart size={20} color="#ff6b9d" fill="#ff6b9d" />
              </Animated.View>
              <Text style={styles.logo}>The Club</Text>
            </View>
          </Animated.View>
          
          <TouchableOpacity 
            onPress={handleMessagesPress} 
            style={styles.messagesButton}
          >
            <MessageCircle size={20} color="#e0aaff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Subtle divider */}
        <View style={styles.divider} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#000000',
  },
  container: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoContainer: {
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartContainer: {
    marginRight: 6,
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9B61E5',
    letterSpacing: 0.5,
  },
  messagesButton: {
    position: 'relative',
    padding: 6,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 97, 229, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#9B61E5',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000000',
  },
  notificationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(155, 97, 229, 0.2)',
    marginHorizontal: 16,
  },
});