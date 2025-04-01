import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { OCRDetection } from "react-native-executorch";
import * as Clipboard from "expo-clipboard";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GeneratingOCRModalProps {
  results: OCRDetection[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ModalRef {
  show: () => void;
  hide: () => void;
  setGenerating: (isGenerating: boolean) => void;
}

const { height } = Dimensions.get("window");

const GeneratingOCRModal = forwardRef<ModalRef, GeneratingOCRModalProps>(
  (props, ref) => {
    const { bottom = 0 } = useSafeAreaInsets();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useRef(["65%"]).current;

    const color = useThemeColor({}, "tabIconSelected");
    const backgroundColor = useThemeColor({}, "background");

    const [isGenerating, setIsGenerating] = useState(false);

    const resultString = props?.results?.map(({ text }) => text).join("\t");

    useImperativeHandle(ref, () => ({
      show: () => openModal(),
      hide: () => closeModal(),
      setGenerating: (isGenerating: boolean) => setIsGenerating(isGenerating),
    }));

    const handleCopy = async () => {
      try {
        await Clipboard.setStringAsync(resultString);

        Alert.alert("Success", "Text copied to clipboard");
      } catch (error) {
        Alert.alert("Error", "Failed to copy text");
      }
    };

    const openModal = () => {
      bottomSheetModalRef.current?.present();
    };

    const closeModal = () => {
      bottomSheetModalRef.current?.dismiss();
      props?.onClose?.();
    };

    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} pressBehavior={"close"} />
    );

    const renderBody = () => {
      if (isGenerating) {
        return (
          <View style={styles.content}>
            <ActivityIndicator size="small" color={color} />
            <ThemedText type="defaultSemiBold">Generating...</ThemedText>
          </View>
        );
      }

      return (
        <View style={styles.body}>
          {props?.results?.length > 0 && (
            <ScrollView style={styles.resultList}>
              <ThemedText style={styles.resultLabel}>{resultString}</ThemedText>
            </ScrollView>
          )}
          <View style={[styles.copyButton, { marginBottom: bottom }]}>
            <Button title="Copy to Clipboard" onPress={handleCopy} />
          </View>
        </View>
      );
    };

    return (
      <BottomSheetModal
        index={0}
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleStyle={{
          backgroundColor: backgroundColor,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        }}
        handleIndicatorStyle={{ backgroundColor: color }}
      >
        <BottomSheetView style={[styles.container, { backgroundColor }]}>
          <ThemedView style={styles.body}>{renderBody()}</ThemedView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default GeneratingOCRModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultList: {
    flex: 1,
    padding: 16,
  },
  resultLabel: {
    flex: 1,
  },
  body: {
    flex: 1,
    height: height * 0.6,
  },
  copyButton: {
    padding: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIndicator: {
    backgroundColor: "#000",
  },
});
