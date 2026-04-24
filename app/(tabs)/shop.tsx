import { FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { STICKERS, Sticker, useSteps } from '@/contexts/StepsContext';

function StickerCard({ sticker, owned, onPress }: { sticker: Sticker; owned: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, owned && styles.cardOwned]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.emoji, owned && styles.emojiOwned]}>{sticker.emoji}</Text>
      <Text style={[styles.name, owned && styles.nameOwned]}>{sticker.name}</Text>
      {owned ? (
        <Text style={styles.purchasedLabel}>Purchased</Text>
      ) : (
        <Text style={styles.cost}>{sticker.cost} 👟</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const { stepBalance, ownedStickerIds, purchaseSticker } = useSteps();

  function handlePress(sticker: Sticker) {
    if (ownedStickerIds.includes(sticker.id)) return;
    Alert.alert(
      `Buy ${sticker.name}?`,
      `Cost: ${sticker.cost} steps\nYour balance: ${stepBalance} steps`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => {
            const ok = purchaseSticker(sticker.id);
            if (!ok) Alert.alert('Not enough steps!', `You need ${sticker.cost} steps but only have ${stepBalance}.`);
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.balanceBar}>
        <Text style={styles.balanceText}>Balance: {stepBalance.toLocaleString()} 👟</Text>
      </View>

      <FlatList
        data={STICKERS}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <StickerCard
            sticker={item}
            owned={ownedStickerIds.includes(item.id)}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.3)',
    backgroundColor: 'transparent',
  },
  balanceText: { fontSize: 16, fontWeight: '600' },
  grid: { padding: 12 },
  row: { gap: 8, marginBottom: 8 },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  cardOwned: { opacity: 0.4 },
  emoji: { fontSize: 32 },
  emojiOwned: {},
  name: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  nameOwned: {},
  cost: { fontSize: 11, color: '#888' },
  purchasedLabel: { fontSize: 11, color: '#888', fontStyle: 'italic' },
});
