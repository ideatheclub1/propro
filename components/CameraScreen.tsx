import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { X, RotateCcw, Zap, ZapOff, Image, Video, Circle, Camera, AlertCircle } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

type CameraMode = 'Post' | 'Reel' | 'Story' | 'Live';

const cameraFilters = [
  { id: 'normal', name: 'Normal', emoji: '📷' },
  { id: 'vintage', name: 'Vintage', emoji: '🎞️' },
  { id: 'blackwhite', name: 'B&W', emoji: '⚫' },
  { id: 'sepia', name: 'Sepia', emoji: '🤎' },
  { id: 'vibrant', name: 'Vibrant', emoji: '🌈' },
  { id: 'cool', name: 'Cool', emoji: '❄️' },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CameraScreen({ isVisible, onClose }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [currentMode, setCurrentMode] = useState<CameraMode>('Post');
  const [isRecording, setIsRecording] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');

  // Animation values
  const recordButtonScale = useSharedValue(1);
  const recordButtonPulse = useSharedValue(0);
  const modeGlow = useSharedValue(0);
  const filterPanelY = useSharedValue(SCREEN_HEIGHT);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      recordButtonPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      recordButtonPulse.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording]);

  useEffect(() => {
    // Soft glow animation for active mode
    modeGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (showFilters) {
      filterPanelY.value = withSpring(0, { damping: 15 });
    } else {
      filterPanelY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [showFilters]);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const handleModeChange = (mode: CameraMode) => {
    triggerHaptic();
    setCurrentMode(mode);
  };

  const handleFlipCamera = () => {
    triggerHaptic();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleFlashToggle = () => {
    triggerHaptic();
    const newMode = flashMode === 'off' ? 'on' : 'off';
    setFlashMode(newMode);
    
    if (newMode === 'on') {
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  };

  const handleRecord = () => {
    triggerHaptic();
    if (currentMode === 'Post') {
      // Take photo
      Alert.alert('Photo', 'Photo capture functionality would be implemented here');
    } else {
      // Start/stop recording
      setIsRecording(!isRecording);
      recordButtonScale.value = withSequence(
        withSpring(0.8, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    }
  };

  const handleGalleryImport = async () => {
    triggerHaptic();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: currentMode === 'Post' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: currentMode === 'Story' ? [9, 16] : [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Import', 'Media import functionality would be implemented here');
    }
  };

  const handleFilterSelect = (filterId: string) => {
    triggerHaptic();
    setSelectedFilter(filterId);
    setShowFilters(false);
  };

  // Animated styles
  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: recordButtonScale.value * recordButtonPulse.value }
      ],
    };
  });

  const modeGlowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(modeGlow.value, [0, 1], [0.3, 0.7]),
      shadowRadius: interpolate(modeGlow.value, [0, 1], [8, 16]),
    };
  });

  const filterPanelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: filterPanelY.value }],
    };
  });

  const flashOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  // Permission denied fallback
  if (!permission) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Camera size={48} color="#6C5CE7" />
          <Text style={styles.fallbackTitle}>Loading camera...</Text>
          <Text style={styles.fallbackSubtitle}>Please wait while we check permissions</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallbackContainer}>
        <LinearGradient
          colors={['#1E1E1E', '#2A2A2A']}
          style={styles.fallbackGradient}
        >
          <View style={styles.fallbackContent}>
            <AlertCircle size={64} color="#6C5CE7" />
            <Text style={styles.fallbackTitle}>Camera Access Needed</Text>
            <Text style={styles.fallbackSubtitle}>
              We need camera access to take photos and record videos
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient
                colors={['#6C5CE7', '#5A4FCF']}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const ModeSelector = () => (
    <View style={styles.modeContainer}>
      <BlurView intensity={Platform.OS === 'ios' ? 40 : 0} style={styles.modeBlur}>
        <View style={styles.modeSelector}>
          {(['Post', 'Reel', 'Story', 'Live'] as CameraMode[]).map((mode) => (
            <Animated.View
              key={mode}
              style={[
                styles.modeButtonContainer,
                currentMode === mode && modeGlowStyle
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  currentMode === mode && styles.activeModeButton
                ]}
                onPress={() => handleModeChange(mode)}
              >
                <Text style={[
                  styles.modeText,
                  currentMode === mode && styles.activeModeText
                ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </BlurView>
    </View>
  );

  const FilterPanel = () => (
    <Animated.View style={[styles.filterPanel, filterPanelStyle]}>
      <BlurView intensity={Platform.OS === 'ios' ? 60 : 0} style={styles.filterBlur}>
        <LinearGradient
          colors={['rgba(30, 30, 30, 0.95)', 'rgba(42, 42, 42, 0.9)']}
          style={styles.filterGradient}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterGrid}>
            {cameraFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterCard,
                  selectedFilter === filter.id && styles.selectedFilterCard
                ]}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                <Text style={[
                  styles.filterName,
                  selectedFilter === filter.id && styles.selectedFilterName
                ]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flashMode}
      >
        {/* Flash overlay */}
        <Animated.View style={[styles.flashOverlay, flashOverlayStyle]} />
        
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.topButton} onPress={onClose}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <X size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.topButton} 
            onPress={() => setShowFilters(true)}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <Text style={styles.filterButtonText}>Filters</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
        
        {/* Side Controls */}
        <View style={styles.sideControls}>
          <TouchableOpacity style={styles.sideButton} onPress={handleFlipCamera}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <RotateCcw size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sideButton} onPress={handleFlashToggle}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              {flashMode === 'on' ? (
                <Zap size={24} color="#FFD700" fill="#FFD700" />
              ) : (
                <ZapOff size={24} color="#FFFFFF" />
              )}
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sideButton} onPress={handleGalleryImport}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <Image size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Record Button */}
          <AnimatedTouchableOpacity
            style={[styles.recordButtonContainer, recordButtonStyle]}
            onPress={handleRecord}
          >
            <LinearGradient
              colors={isRecording ? ['#EF4444', '#DC2626'] : ['#6C5CE7', '#5A4FCF']}
              style={styles.recordButton}
            >
              {currentMode === 'Post' ? (
                <Circle size={32} color="#FFFFFF" />
              ) : (
                <View style={[
                  styles.recordIndicator,
                  isRecording && styles.recordingIndicator
                ]} />
              )}
            </LinearGradient>
          </AnimatedTouchableOpacity>
        </View>
        
        {/* Mode Selector */}
        <ModeSelector />
        
        {/* Filter Panel */}
        <FilterPanel />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  camera: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  fallbackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
  },
  permissionButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  topButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlBlur: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: '40%',
    gap: 16,
    zIndex: 5,
  },
  sideButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButton: {
    flex: 1,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  recordingIndicator: {
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  modeContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  modeBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButtonContainer: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeModeButton: {
    backgroundColor: '#6C5CE7',
  },
  modeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.7,
  },
  activeModeText: {
    opacity: 1,
    color: '#FFFFFF',
  },
  filterPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    zIndex: 10,
  },
  filterBlur: {
    flex: 1,
  },
  filterGradient: {
    flex: 1,
    padding: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  filterCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFilterCard: {
    borderColor: '#6C5CE7',
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
  },
  filterEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  filterName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  selectedFilterName: {
    opacity: 1,
    color: '#6C5CE7',
  },
});