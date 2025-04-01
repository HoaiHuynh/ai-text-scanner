import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  Alert,
  Button,
  ActivityIndicator,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from "react-native-vision-camera";
import * as ImagePicker from "expo-image-picker";
import * as Network from "expo-network";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "@/components/ScaleButton";
import {
  DETECTOR_CRAFT_800,
  OCRDetection,
  RECOGNIZER_EN_CRNN_128,
  RECOGNIZER_EN_CRNN_256,
  RECOGNIZER_EN_CRNN_512,
  useOCR,
} from "react-native-executorch";
import { ModalRef } from "@/components/GeneratingOCRModal";
import GeneratingOCRModal from "@/components/GeneratingOCRModal";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useOCRTextActions } from "@/hooks/useOCRTextStore";

const { width, height } = Dimensions.get("window");

const aspectRatio = 3 / 4;
const imageWidth = width;
const imageHeight = imageWidth / aspectRatio;
const headerHeight = (height - imageHeight) * 0.4;
const footerHeight = (height - imageHeight) * 0.6;

export default function HomeScreen() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const { addOCRText } = useOCRTextActions();

  const color = useThemeColor({}, "text");

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [results, setResults] = useState<OCRDetection[]>([]);

  const camera = useRef<Camera>(null);
  const bottomSheetModalRef = useRef<ModalRef>(null);
  const grid = Array(2).fill(0);

  const networkState = Network.useNetworkState();
  const isOnline = networkState.type !== Network.NetworkStateType.NONE;

  useEffect(() => {
    if (!isOnline) {
      Alert.alert("Error", "Please connect to the internet");
    }
  }, [isOnline]);

  const format = useCameraFormat(device, [
    { photoResolution: { width: imageWidth, height: imageHeight } },
  ]);

  /**
   * OCR model
   * This is On-device OCR model to recognize text from images
   */
  const model = useOCR({
    detectorSource: DETECTOR_CRAFT_800,
    recognizerSources: {
      recognizerLarge: RECOGNIZER_EN_CRNN_512,
      recognizerMedium: RECOGNIZER_EN_CRNN_256,
      recognizerSmall: RECOGNIZER_EN_CRNN_128,
    },
    language: "en",
  });

  const handleOpenLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      if (
        result?.assets?.[0]?.fileSize &&
        result?.assets?.[0]?.fileSize > 2 * 1024 * 1024
      ) {
        Alert.alert(
          "Image too large",
          "Please select an image smaller than 2MB"
        );

        return;
      }

      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    try {
      const photoTaken = await camera?.current?.takePhoto();

      if (photoTaken) {
        setPhotoUri(photoTaken?.path);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleClearPhoto = () => {
    setPhotoUri(null);
    setResults([]);
  };

  const handleGenerateOCR = async () => {
    try {
      if (!photoUri) {
        return;
      }

      bottomSheetModalRef?.current?.show();
      bottomSheetModalRef?.current?.setGenerating(true);

      const output = await model.forward(photoUri);
      bottomSheetModalRef?.current?.setGenerating(false);

      if (output?.length === 0) {
        Alert.alert("Alert", "No text detected");

        bottomSheetModalRef?.current?.hide();
        bottomSheetModalRef?.current?.setGenerating(false);

        return;
      }

      const textString = output.map(({ text }) => text).join("\t");

      setResults(output);
      addOCRText(textString);
    } catch (error) {
      console.log("error: ", error);

      Alert.alert("Error", "Failed to recognize text");

      bottomSheetModalRef?.current?.hide();
      bottomSheetModalRef?.current?.setGenerating(false);
    }
  };

  if (!model?.isReady && model?.downloadProgress < 1) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.row, { columnGap: 16 }]}>
          <ActivityIndicator size="large" color={color} />
          <ThemedText type="subtitle" style={styles.largeText}>
            {`Downloading model... ${model?.downloadProgress?.toFixed(2)}%`}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!device) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.largeText}>Camera not available</ThemedText>
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.largeText}>
          Camera permission not granted
        </ThemedText>
        <Button title="Request permission" onPress={requestPermission} />
      </ThemedView>
    );
  }

  const renderGrid = () => {
    return (
      <>
        <View style={[styles.gridContainer, { marginTop: headerHeight }]}>
          {grid.map((_, index) => (
            <View key={`h-${index}`} style={styles.horizontalLine} />
          ))}
        </View>
        <View
          style={[styles.verticalLineContainer, { marginTop: headerHeight }]}
        >
          {grid.map((_, index) => (
            <View key={`v-${index}`} style={styles.verticalLine} />
          ))}
        </View>
      </>
    );
  };

  const renderCameraOrImage = () => {
    if (photoUri) {
      return (
        <View style={styles.full}>
          <View style={{ height: headerHeight }} />
          <Image
            source={{ uri: photoUri }}
            resizeMode="contain"
            style={styles.image}
          />
          <View style={{ height: footerHeight }} />
        </View>
      );
    }

    return (
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        format={format}
      />
    );
  };

  const renderFooterButton = () => {
    if (photoUri) {
      return (
        <View style={styles.row}>
          <View style={styles.empty} />

          <ScaleButton size={80} onPress={handleGenerateOCR}>
            <Ionicons name="checkmark-outline" size={32} color="#000000" />
          </ScaleButton>

          <ScaleButton
            size={60}
            activeColor="#DC354580"
            onPress={handleClearPhoto}
          >
            <Ionicons name="close-outline" size={32} color="#FFFFFF" />
          </ScaleButton>
        </View>
      );
    }

    return (
      <View style={styles.row}>
        <ScaleButton
          size={60}
          activeColor="#4696d2"
          onPress={handleOpenLibrary}
        >
          <Ionicons name="image-outline" size={32} color="#FFFFFF" />
        </ScaleButton>

        <ScaleButton size={80} onPress={handleTakePicture}>
          <Ionicons name="camera-outline" size={32} color="#000000" />
        </ScaleButton>

        <View style={styles.empty} />
      </View>
    );
  };

  return (
    <>
      <ThemedView style={styles.container}>
        {renderCameraOrImage()}

        <View style={styles.header} />
        <View style={styles.footer}>{renderFooterButton()}</View>

        {renderGrid()}
      </ThemedView>
      <GeneratingOCRModal results={results} ref={bottomSheetModalRef} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  full: {
    flex: 1,
  },
  image: {
    width: imageWidth,
    height: imageHeight,
  },
  gridContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: imageWidth,
    height: imageHeight,
  },
  verticalLine: {
    width: StyleSheet.hairlineWidth,
    height: imageHeight,
    backgroundColor: "#FFFFFF",
  },
  verticalLineContainer: {
    flex: 1,
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: 0,
    width: imageWidth,
    height: imageHeight,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  horizontalLine: {
    height: StyleSheet.hairlineWidth,
    width: width,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "absolute",
    top: 0,
    height: headerHeight,
    width: width,
    backgroundColor: "#00000080",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    height: footerHeight,
    width: width,
    paddingTop: 28,
    backgroundColor: "#00000080",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  capture: {
    height: 80,
    width: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  library: {
    height: 60,
    width: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    width: 60,
    height: 60,
  },
  clear: {
    height: 60,
    width: 60,
    backgroundColor: "#DC3545",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  largeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
