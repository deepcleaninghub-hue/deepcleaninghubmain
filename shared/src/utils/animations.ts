/**
 * Animation Utilities
 * 
 * Advanced animation system with smooth transitions,
 * gesture handling, and performance optimizations.
 */

import { Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation presets
export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 300,
    easing: Easing.out(Easing.quad),
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 300,
    easing: Easing.in(Easing.quad),
  },
  
  // Slide animations
  slideInFromRight: {
    from: { transform: [{ translateX: SCREEN_WIDTH }] },
    to: { transform: [{ translateX: 0 }] },
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromLeft: {
    from: { transform: [{ translateX: -SCREEN_WIDTH }] },
    to: { transform: [{ translateX: 0 }] },
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromBottom: {
    from: { transform: [{ translateY: SCREEN_HEIGHT }] },
    to: { transform: [{ translateY: 0 }] },
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromTop: {
    from: { transform: [{ translateY: -SCREEN_HEIGHT }] },
    to: { transform: [{ translateY: 0 }] },
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  // Scale animations
  scaleIn: {
    from: { transform: [{ scale: 0 }] },
    to: { transform: [{ scale: 1 }] },
    duration: 300,
    easing: Easing.out(Easing.back(1.2)),
  },
  scaleOut: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 0 }] },
    duration: 300,
    easing: Easing.in(Easing.back(1.2)),
  },
  
  // Bounce animations
  bounceIn: {
    from: { transform: [{ scale: 0.3 }] },
    to: { transform: [{ scale: 1 }] },
    duration: 600,
    easing: Easing.out(Easing.bounce),
  },
  
  // Shake animation
  shake: {
    from: { transform: [{ translateX: 0 }] },
    to: { transform: [{ translateX: 0 }] },
    duration: 500,
    easing: Easing.linear,
  },
  
  // Pulse animation
  pulse: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 1.05 }] },
    duration: 1000,
    easing: Easing.inOut(Easing.sine),
  },
};

// Animation utility functions
export class AnimationUtils {
  static createTimingAnimation(
    value: Animated.Value,
    toValue: number,
    duration: number = 300,
    easing: any = Easing.out(Easing.quad),
    delay: number = 0
  ): Animated.CompositeAnimation {
    return Animated.timing(value, {
      toValue,
      duration,
      easing,
      delay,
      useNativeDriver: true,
    });
  }

  static createSpringAnimation(
    value: Animated.Value,
    toValue: number,
    tension: number = 100,
    friction: number = 8,
    delay: number = 0
  ): Animated.CompositeAnimation {
    return Animated.spring(value, {
      toValue,
      tension,
      friction,
      delay,
      useNativeDriver: true,
    });
  }

  static createSequence(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
    return Animated.sequence(animations);
  }

  static createParallel(
    animations: Animated.CompositeAnimation[],
    stopTogether: boolean = true
  ): Animated.CompositeAnimation {
    return Animated.parallel(animations, { stopTogether });
  }

  static createStagger(
    animations: Animated.CompositeAnimation[],
    staggerTime: number = 100
  ): Animated.CompositeAnimation {
    const staggeredAnimations = animations.map((animation, index) => {
      return Animated.delay(index * staggerTime, animation);
    });
    return Animated.parallel(staggeredAnimations);
  }

  static createLoop(
    animation: Animated.CompositeAnimation,
    iterations: number = -1
  ): Animated.CompositeAnimation {
    return Animated.loop(animation, { iterations });
  }

  // Preset animations
  static fadeIn(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 1, duration, Easing.out(Easing.quad));
  }

  static fadeOut(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.in(Easing.quad));
  }

  static slideInFromRight(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.out(Easing.cubic));
  }

  static slideInFromLeft(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.out(Easing.cubic));
  }

  static slideInFromBottom(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.out(Easing.cubic));
  }

  static slideInFromTop(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.out(Easing.cubic));
  }

  static scaleIn(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 1, duration, Easing.out(Easing.back(1.2)));
  }

  static scaleOut(value: Animated.Value, duration: number = 300): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 0, duration, Easing.in(Easing.back(1.2)));
  }

  static bounceIn(value: Animated.Value, duration: number = 600): Animated.CompositeAnimation {
    return this.createTimingAnimation(value, 1, duration, Easing.out(Easing.bounce));
  }

  static shake(value: Animated.Value, duration: number = 500): Animated.CompositeAnimation {
    const shakeSequence = Animated.sequence([
      Animated.timing(value, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
    return shakeSequence;
  }

  static pulse(value: Animated.Value, duration: number = 1000): Animated.CompositeAnimation {
    return this.createLoop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.05,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Gesture animations
  static createPanGesture(value: Animated.Value, onGestureEvent: any): Animated.CompositeAnimation {
    return Animated.event([{ nativeEvent: { translationX: value } }], {
      useNativeDriver: true,
      listener: onGestureEvent,
    });
  }

  static createPinchGesture(value: Animated.Value, onGestureEvent: any): Animated.CompositeAnimation {
    return Animated.event([{ nativeEvent: { scale: value } }], {
      useNativeDriver: true,
      listener: onGestureEvent,
    });
  }

  // Interpolation utilities
  static createInterpolation(
    value: Animated.Value,
    inputRange: number[],
    outputRange: any[],
    extrapolate?: 'clamp' | 'extend' | 'identity'
  ): Animated.AnimatedInterpolation {
    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate: extrapolate || 'clamp',
    });
  }

  static createColorInterpolation(
    value: Animated.Value,
    inputRange: number[],
    outputRange: string[]
  ): Animated.AnimatedInterpolation {
    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }

  // Performance utilities
  static createNativeDriverAnimation(
    value: Animated.Value,
    toValue: number,
    duration: number = 300
  ): Animated.CompositeAnimation {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
    });
  }

  static createLayoutAnimation(
    duration: number = 300,
    type: 'spring' | 'linear' | 'easeInEaseOut' = 'spring'
  ): any {
    return {
      duration,
      create: {
        type,
        property: 'opacity',
      },
      update: {
        type,
        property: 'opacity',
      },
      delete: {
        type,
        property: 'opacity',
      },
    };
  }
}

// Animation hooks
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = new Animated.Value(initialValue);
  
  const animate = (
    toValue: number,
    duration: number = 300,
    easing: any = Easing.out(Easing.quad)
  ) => {
    return AnimationUtils.createTimingAnimation(animatedValue, toValue, duration, easing);
  };
  
  const spring = (
    toValue: number,
    tension: number = 100,
    friction: number = 8
  ) => {
    return AnimationUtils.createSpringAnimation(animatedValue, toValue, tension, friction);
  };
  
  const reset = () => {
    animatedValue.setValue(initialValue);
  };
  
  return {
    animatedValue,
    animate,
    spring,
    reset,
  };
};

// Export commonly used animations
export const CommonAnimations = {
  fadeIn: (value: Animated.Value) => AnimationUtils.fadeIn(value),
  fadeOut: (value: Animated.Value) => AnimationUtils.fadeOut(value),
  slideInFromRight: (value: Animated.Value) => AnimationUtils.slideInFromRight(value),
  slideInFromLeft: (value: Animated.Value) => AnimationUtils.slideInFromLeft(value),
  slideInFromBottom: (value: Animated.Value) => AnimationUtils.slideInFromBottom(value),
  slideInFromTop: (value: Animated.Value) => AnimationUtils.slideInFromTop(value),
  scaleIn: (value: Animated.Value) => AnimationUtils.scaleIn(value),
  scaleOut: (value: Animated.Value) => AnimationUtils.scaleOut(value),
  bounceIn: (value: Animated.Value) => AnimationUtils.bounceIn(value),
  shake: (value: Animated.Value) => AnimationUtils.shake(value),
  pulse: (value: Animated.Value) => AnimationUtils.pulse(value),
};
