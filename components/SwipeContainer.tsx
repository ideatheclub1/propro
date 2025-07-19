import React, { useState, useRef } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import CameraScreen from './CameraScreen';
import MessagesPanel from './MessagesPanel';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SNAP_POINT = SCREEN_WIDTH * 0.8;

interface SwipeContainerProps {
  children: React.ReactNode;
}

type SwipeDirection = 'left' | 'center' | 'right';

export default function SwipeContainer({ children }: SwipeContainerProps) {
  const [currentView, setCurrentView] = useState<SwipeDirection>('center');
  const translateX = useSharedValue(0);
  const cameraOpacity = useSharedValue(0);
  const messagesOpacity = useSharedValue(0);
  const backgroundBlur = useSharedValue(0);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const snapToView = (direction: SwipeDirection) => {
    let targetX = 0;
    
    switch (direction) {
      case 'left':
        targetX = SCREEN_WIDTH;
        cameraOpacity.value = withTiming(1, { duration: 300 });
        messagesOpacity.value = withTiming(0, { duration: 300 });
        backgroundBlur.value = withTiming(1, { duration: 300 });
        break;
      case 'right':
        targetX = -SNAP_POINT;
        cameraOpacity.value = withTiming(0, { duration: 300 });
        messagesOpacity.value = withTiming(1, { duration: 300 });
        backgroundBlur.value = withTiming(0.5, { duration: 300 });
        break;
      case 'center':
      default:
        targetX = 0;
        cameraOpacity.value = withTiming(0, { duration: 300 });
        messagesOpacity.value = withTiming(0, { duration: 300 });
        backgroundBlur.value = withTiming(0, { duration: 300 });
        break;
    }

    translateX.value = withSpring(targetX, {
      damping: 15,
      stiffness: 120,
    });
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      runOnJS(triggerHaptic)();
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      
      // Update opacity values based on swipe direction
      if (event.translationX > 0) {
        // Swiping right (showing camera)
        const progress = Math.min(event.translationX / SCREEN_WIDTH, 1);
        cameraOpacity.value = progress;
        messagesOpacity.value = 0;
        backgroundBlur.value = progress;
      } else if (event.translationX < 0) {
        // Swiping left (showing messages)
        const progress = Math.min(Math.abs(event.translationX) / SNAP_POINT, 1);
        messagesOpacity.value = progress;
        cameraOpacity.value = 0;
        backgroundBlur.value = progress * 0.5;
      } else {
        cameraOpacity.value = 0;
        messagesOpacity.value = 0;
        backgroundBlur.value = 0;
      }
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right to camera
        runOnJS(setCurrentView)('left');
        runOnJS(snapToView)('left');
        runOnJS(triggerHaptic)();
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left to messages
        runOnJS(setCurrentView)('right');
        runOnJS(snapToView)('right');
        runOnJS(triggerHaptic)();
      } else {
        // Snap back to center
        runOnJS(setCurrentView)('center');
        runOnJS(snapToView)('center');
      }
    },
  });

  const handleCloseMessages = () => {
    setCurrentView('center');
    snapToView('center');
  };

  const handleCloseCamera = () => {
    setCurrentView('center');
    snapToView('center');
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        backgroundBlur.value,
        [0, 1],
        [1, 0.3],
        Extrapolate.CLAMP
      ),
    };
  });

  const cameraStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      cameraOpacity.value,
      [0, 1],
      [0.9, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: cameraOpacity.value,
      transform: [{ scale }],
      pointerEvents: cameraOpacity.value > 0.5 ? 'auto' : 'none',
    };
  });

  const messagesStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      messagesOpacity.value,
      [0, 1],
      [SCREEN_WIDTH, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: messagesOpacity.value,
      transform: [{ translateX }],
      pointerEvents: messagesOpacity.value > 0.5 ? 'auto' : 'none',
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />
      
      {/* Background dimming overlay */}
      <Animated.View style={[styles.backgroundOverlay, backgroundStyle]} />
      
      {/* Main content container */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.mainContainer, containerStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
      
      {/* Camera Screen (Left Swipe) */}
      <Animated.View style={[styles.cameraContainer, cameraStyle]}>
        <CameraScreen 
          isVisible={currentView === 'left'} 
          onClose={handleCloseCamera}
        />
      </Animated.View>
      
      {/* Messages Panel (Right Swipe) */}
      <Animated.View style={[styles.messagesContainer, messagesStyle]}>
        <MessagesPanel 
          isVisible={currentView === 'right'} 
          onClose={handleCloseMessages}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1E1E',
    zIndex: 1,
  },
  mainContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    zIndex: 2,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: -SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 3,
  },
  messagesContainer: {
    position: 'absolute',
    top: 0,
    right: -SCREEN_WIDTH,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT,
    zIndex: 3,
  },
});