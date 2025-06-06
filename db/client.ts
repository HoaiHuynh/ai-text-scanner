import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync("my-ocr-app.db", { useNewConnection: true });

export const db = drizzle(expoDb);
