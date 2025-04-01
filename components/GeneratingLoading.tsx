import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";

interface GeneratingLoadingProps {}

export interface GeneratingLoadingRef {
  show: () => void;
  hide: () => void;
}

const GeneratingLoading = forwardRef<
  GeneratingLoadingRef,
  GeneratingLoadingProps
>((props, ref) => {
  const {} = props;

  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  const scale = useSharedValue(1);

  const show = () => {
    setVisible(true);
    scale.value = withSpring(1, { duration: 300 });
  };
  const hide = () => {
    scale.value = withSpring(0, { duration: 300 });
    setVisible(false);
  };

  const animatedView = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedView]}>
      <ActivityIndicator color="#FFFFFF" />
      <ThemedText>Generating...</ThemedText>
    </Animated.View>
  );
});

export default GeneratingLoading;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5473b090",
    flexDirection: "row",
    columnGap: 8,
    borderRadius: 8,
  },
});
