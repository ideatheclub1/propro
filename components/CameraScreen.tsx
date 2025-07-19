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
import { 
  X, 
  RotateCcw, 
  Zap, 
  ZapOff, 
  Image, 
  Video, 
  Circle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

type CameraMode = 'post' | 'reel' | 'story' | 'live';

interface FilterOption {
  id: string;
  name: string;
  preview: string;
}

const cameraFilters: FilterOption[] = [
  { id: 'normal', name: 'Normal', preview: '📷' },
  { id: 'vintage', name: 'Vintage', preview: '🎞️' },
  { id: 'blackwhite', name: 'B&W', preview: '⚫' },
  { id: 'sepia', name: 'Sepia', preview: '🤎' },
  { id: 'vibrant', name: 'Vibrant', preview: '🌈' },
  { id: 'cool', name: 'Cool', preview: '❄️' },
  { id: 'warm', name: 'Warm', preview: '🔥' },
  { id: 'dramatic', name: 'Drama', preview: '⚡' },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CameraScreen({ isVisible, onClose }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [currentMode, setCurrentMode] = useState<CameraMode>('post');
  const [isRecording, setIsRecording] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');

  // Animation values
  const recordButtonScale = useSharedValue(1);
  const recordButtonPulse = useSharedValue(0);
  const modeSlideY = useSharedValue(0);
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
    if (isVisible) {
      modeSlideY.value = withSpring(0, { damping: 15 });
    } else {
      modeSlideY.value = withTiming(100, { duration: 300 });
      setShowFilters(false);
    }
  }, [isVisible]);

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
    modeSlideY.value = withSequence(
      withSpring(-10, { damping: 10 }),
      withSpring(0, { damping: 10 })
    );
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
    if (currentMode === 'post') {
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
      mediaTypes: currentMode === 'post' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: currentMode === 'story' ? [9, 16] : [1, 1],
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

  const modeContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: modeSlideY.value }],
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

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ModeSelector = () => (
    <Animated.View style={[styles.modeContainer, modeContainerStyle]}>
      <BlurView intensity={Platform.OS === 'ios' ? 50 : 0} style={styles.modeBlur}>
        <View style={styles.modeSelector}>
          {(['post', 'reel', 'story', 'live'] as CameraMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
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
                {mode.toUpperCase()}
              </Text>
              {currentMode === mode && (
                <View style={styles.modeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );

  const FilterPanel = () => (
    <Animated.View style={[styles.filterPanel, filterPanelStyle]}>
      <BlurView intensity={Platform.OS === 'ios' ? 60 : 0} style={styles.filterBlur}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filters</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <ChevronDown size={24} color="#FFFFFF" />
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
              <Text style={styles.filterEmoji}>{filter.preview}</Text>
              <Text style={[
                styles.filterName,
                selectedFilter === filter.id && styles.selectedFilterName
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <X size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFilters(true)}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 0} style={styles.controlBlur}>
              <Filter size={20} color="#FFFFFF" />
              <ChevronUp size={16} color="#FFFFFF" />
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
              {currentMode === 'post' ? (
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  closeButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  filterButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlBlur: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    bottom: 180,
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
    shadowColor: '#000000',
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
    bottom: 80,
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
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  activeModeButton: {
    backgroundColor: 'rgba(108, 92, 231, 0.8)',
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
  modeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C5CE7',
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