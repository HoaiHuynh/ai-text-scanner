import { desc, eq } from "drizzle-orm";
import { create } from "zustand";
import { db } from "@/db/client";
import { OCRTexts, SelectOCRText } from "@/db/schema";

const generateUUID = () => {
  // Define the possible characters for each digit
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  // Initialize an empty string to store the UUID
  let uuid = "";
  // Loop through 5 times to generate each digit
  for (let i = 0; i < 5; i++) {
    // Pick a random index from 0 to 35
    let index = Math.floor(Math.random() * chars.length);
    // Append the character at that index to the UUID
    uuid += chars[index];
  }
  // Return the UUID
  return uuid;
};

type OCRTextStore = {
  ocrTexts: SelectOCRText[];
  actions: {
    refetchOCRTexts: () => void;
    getOCRText: (id: string) => SelectOCRText | undefined;
    addOCRText: (text: string) => void;
    deleteOCRText: (id: string) => void;
  };
};

const getAllOCRTexts = () => {
  const fetchOCRTexts = db
    .select()
    .from(OCRTexts)
    .orderBy(desc(OCRTexts.createdAt));

  const allOCRTexts = fetchOCRTexts?.all();

  return allOCRTexts ?? [];
};

const getOCRText = (id: string) => {
  const fetchOCRText = db.select().from(OCRTexts).where(eq(OCRTexts.id, id));

  const ocrText = fetchOCRText?.get();

  return ocrText;
};

const addOCRText = (text: string) => {
  const insertOCRText = db.insert(OCRTexts).values({
    id: generateUUID(),
    text,
    createdAt: new Date().toISOString(),
  });

  insertOCRText.run();
};

const deleteOCRText = (id: string) => {
  const deleteOCRText = db.delete(OCRTexts).where(eq(OCRTexts.id, id));

  deleteOCRText.run();
};

export const useOCRTextStore = create<OCRTextStore>((set) => ({
  ocrTexts: getAllOCRTexts(),
  actions: {
    refetchOCRTexts: () => set({ ocrTexts: getAllOCRTexts() }),
    getOCRText: (id: string) => getOCRText(id),
    addOCRText: (text: string) => addOCRText(text),
    deleteOCRText: (id: string) => deleteOCRText(id),
  },
}));

export default useOCRTextStore;

export const useOCRTexts = () => useOCRTextStore((state) => state.ocrTexts);
export const useOCRTextActions = () =>
  useOCRTextStore((state) => state.actions);
