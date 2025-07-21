import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image, Video, Music, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import CameraScreen from '../../components/CameraScreen';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CreateScreen() {
  const router = useRouter();
  const [showCamera, setShowCamera] = React.useState(false);

  const handleCreatePost = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === 'Video' || type === 'Photo') {
      setShowCamera(true);
    } else {
      Alert.alert('Create', `${type} creation functionality would open here`);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const CreateOption = ({ 
    icon: IconComponent, 
    title, 
    subtitle, 
    onPress, 
    colors 
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    colors: string[];
  }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedTouchableOpacity
        style={[styles.optionCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient colors={colors} style={styles.optionGradient}>
          <View style={styles.optionIcon}>
            <IconComponent size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1E1E', '#2A2A2A', '#1E1E1E']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create</Text>
          <Text style={styles.subtitle}>Share your moment with The Club</Text>
        </View>

        <View style={styles.optionsContainer}>
          <CreateOption
            icon={Camera}
            title="Take Photo"
            subtitle="Capture a new moment"
            onPress={() => handleCreatePost('Photo')}
            colors={['#6C5CE7', '#8B5CF6']}
          />

          <CreateOption
            icon={Video}
            title="Record Video"
            subtitle="Create a short video"
            onPress={() => handleCreatePost('Video')}
            colors={['#EC4899', '#F97316']}
          />

          <CreateOption
            icon={Image}
            title="Upload Media"
            subtitle="Choose from gallery"
            onPress={() => handleCreatePost('Upload')}
            colors={['#10B981', '#059669']}
          />

          <CreateOption
            icon={Music}
            title="Add Music"
            subtitle="Create with soundtrack"
            onPress={() => handleCreatePost('Music')}
            colors={['#F59E0B', '#D97706']}
          />

          <CreateOption
            icon={Play}
            title="Create Shorts"
            subtitle="15-second short videos"
            onPress={() => handleCreatePost('Video')}
            colors={['#10B981', '#059669']}
          />
        </View>
      </LinearGradient>
      
      {/* Camera Screen Modal */}
      <CameraScreen 
        isVisible={showCamera} 
        onClose={handleCloseCamera}
      />
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  optionGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});