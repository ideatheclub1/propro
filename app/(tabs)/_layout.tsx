import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, TrendingUp, Search, User, Play, MessageCircle, Plus } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

const TabIcon = ({ IconComponent, size, color, isActive }: any) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.1);
      glow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
      glow.value = 0;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: isActive ? interpolate(glow.value, [0, 1], [0.3, 0.6]) : 0,
    shadowRadius: isActive ? interpolate(glow.value, [0, 1], [4, 12]) : 0,
  }));

  return (
    <Animated.View style={[animatedStyle, { shadowColor: '#6C5CE7' }]}>
      <IconComponent size={size} color={color} strokeWidth={2} />
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          borderTopColor: 'rgba(108, 92, 231, 0.3)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#6C5CE7',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
          backdropFilter: 'blur(20px)',
        },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={Home} size={size} color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={Play} size={size} color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: focused ? '#6C5CE7' : 'rgba(108, 92, 231, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#6C5CE7',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: focused ? 0.4 : 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}>
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={TrendingUp} size={size} color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={Search} size={size} color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={User} size={size} color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // Hide from tab bar since it's accessible via header
        }}
      />
    </Tabs>
  );
}