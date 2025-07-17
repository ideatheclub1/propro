import { Tabs } from 'expo-router';
import { Chrome as Home, TrendingUp, Search, User, Play } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: 'rgba(155, 97, 229, 0.3)',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#9B61E5',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: '#9B61E5',
        tabBarInactiveTintColor: '#666666',
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Reels',
          tabBarIcon: ({ size, color }) => (
            <Play size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}