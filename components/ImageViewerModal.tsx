import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
}

interface ImageViewerModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export default function ImageViewerModal({ visible, achievement, onClose }: ImageViewerModalProps) {
  const [fontsLoaded] = useFonts({
    PatrickHand_400Regular,
  });

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 20 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleClose = () => {
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  if (!achievement || !fontsLoaded) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        <Animated.View style={[styles.modalContent, animatedStyle]}>
          <View style={styles.stickyNoteModal}>
            {/* Pin */}
            <View style={styles.pin} />
            
            {/* Ruled lines */}
            <View style={styles.ruledLines}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.ruledLine} />
              ))}
            </View>
            
            {/* Close button */}
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#2D3748" />
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.modalContentInner}>
              <Text style={[styles.modalTitle, { fontFamily: 'PatrickHand_400Regular' }]} numberOfLines={3}>
                {achievement.title}
              </Text>
              
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: achievement.fullImage }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={[styles.modalDate, { fontFamily: 'PatrickHand_400Regular' }]}>
                Achievement earned on {achievement.createdAt}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  stickyNoteModal: {
    backgroundColor: '#FFF5B7',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  pin: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ruledLines: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
  },
  ruledLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    zIndex: 10,
  },
  modalContentInner: {
    alignItems: 'center',
    marginTop: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D3748',
  },
  modalDate: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: 'normal',
  },
});