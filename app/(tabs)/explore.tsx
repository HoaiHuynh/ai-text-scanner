import React from "react";
import {
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Button,
  Alert,
  View,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useOCRTextStore, { useOCRTextActions } from "@/hooks/useOCRTextStore";
import { SelectOCRText } from "@/db/schema";

interface OCRItemProps {
  item: SelectOCRText;
  deleteOCRText: (id: string) => void;
}

const OCRItem = ({ item, deleteOCRText }: OCRItemProps) => {
  const onDeleteItem = () => {
    deleteOCRText(item.id);
  };

  return (
    <ThemedView style={styles.item}>
      <View style={styles.contentItem}>
        <View style={styles.text}>
          <ThemedText numberOfLines={4}>{item.text}</ThemedText>
        </View>

        <Button color={"#FF0000"} title="Delete" onPress={onDeleteItem} />
      </View>
    </ThemedView>
  );
};

export default function TabTwoScreen() {
  const { top = 0 } = useSafeAreaInsets();
  const { ocrTexts } = useOCRTextStore();
  const { deleteOCRText, refetchOCRTexts } = useOCRTextActions();

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this record?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteOCRText(id);
          refetchOCRTexts();
        },
      },
    ]);
  };

  const renderItem = ({ item }: ListRenderItemInfo<SelectOCRText>) => {
    return <OCRItem item={item} deleteOCRText={handleDelete} />;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <FlatList
        data={ocrTexts}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <ThemedText type="subtitle">No records found</ThemedText>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetchOCRTexts} />
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  item: {
    paddingVertical: 16,
    marginHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#CCCCCC",
  },
  text: { flex: 1 },
  listContent: {
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    height: 200,
  },
  contentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
