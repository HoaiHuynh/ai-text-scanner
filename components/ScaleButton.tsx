import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ScaleButtonProps extends PressableProps {
  size: number;
  activeColor?: string;
  inactiveColor?: string;
}

const ScaleButton = (props: ScaleButtonProps) => {
  const { size } = props;

  const scale = useSharedValue(1);

  const onPress = (event: GestureResponderEvent) => {
    if (process.env.EXPO_OS === "ios") {
      // Add a soft haptic feedback when pressing down on the tabs.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress?.(event);
  };

  const onPressIn = () => {
    scale.value = withSpring(0.9);
  };

  const onPressOut = () => {
    scale.value = withSequence(withSpring(1.1), withSpring(1));
  };

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handleGetSize = (): StyleProp<ViewStyle> => {
    return {
      height: size,
      width: size,
      borderRadius: size / 2,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props?.activeColor || "#FFFFFF",
    };
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={handleGetSize()}
      >
        {props.children}
      </Pressable>
    </Animated.View>
  );
};

export default ScaleButton;
