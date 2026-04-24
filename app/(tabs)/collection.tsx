import { FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { STICKERS, useSteps } from '@/contexts/StepsContext';

export default function CollectionScreen() {
  const { ownedStickerIds } = useSteps();
  const owned = STICKERS.filter(s => ownedStickerIds.includes(s.id));

  if (owned.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🎴</Text>
        <Text style={styles.emptyTitle}>No stickers yet</Text>
        <Text style={styles.emptyHint}>Head to the Shop tab to buy your first one!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{owned.length} sticker{owned.length !== 1 ? 's' : ''} collected</Text>
      <FlatList
        data={owned}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cost}>{item.cost} 👟</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  count: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    opacity: 0.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  grid: { padding: 12 },
  row: { gap: 8, marginBottom: 8 },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  cost: { fontSize: 10, opacity: 0.45, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyHint: { fontSize: 14, opacity: 0.5 },
});
