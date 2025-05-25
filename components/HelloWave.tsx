import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { theme } from '@/constants/theme';

export function HelloWave() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Sürekli dalga animasyonu
    rotation.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(-20, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ),
      -1, // Sonsuz tekrar
      true // Reverse
    );

    // Giriş animasyonu
    scale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedText style={styles.emoji}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});
