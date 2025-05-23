import { useEffect } from "react";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useFonts } from "expo-font";
import { openDatabaseSync } from "expo-sqlite";
import { SplashScreen } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function useLoadAssets() {
  const expoDb = openDatabaseSync("my-ocr-app.db", { useNewConnection: true });

  const [hasLoadedFonts, loadingFontsError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useDrizzleStudio(expoDb);

  useEffect(() => {
    if (loadingFontsError) throw loadingFontsError;
  }, [loadingFontsError]);

  useEffect(() => {
    if (hasLoadedFonts) {
      SplashScreen.hideAsync();
    }
  }, [hasLoadedFonts]);

  return { isLoaded: hasLoadedFonts };
}
