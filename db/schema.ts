import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

//#region SCHEMA
export const OCRTexts = sqliteTable("ocr_texts", {
  id: text("id").primaryKey(),
  text: text("text"),
  createdAt: text("created_at").notNull(),
});
//#endregion SCHEMA

//#region TYPES
export type SelectOCRText = typeof OCRTexts.$inferSelect;
//#endregion TYPES
