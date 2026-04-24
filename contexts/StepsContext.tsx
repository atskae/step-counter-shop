import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  cost: number;
}

export const STICKERS: Sticker[] = [
  { id: 'smile',    emoji: '😀', name: 'Smile',       cost: 10  },
  { id: 'cool',     emoji: '😎', name: 'Cool',        cost: 10  },
  { id: 'party',    emoji: '🎉', name: 'Party',       cost: 10  },
  { id: 'sparkle',  emoji: '✨', name: 'Sparkle',     cost: 10  },
  { id: 'cherry',   emoji: '🌸', name: 'Cherry',      cost: 100 },
  { id: 'hibiscus', emoji: '🌺', name: 'Hibiscus',    cost: 100 },
  { id: 'sunflower',emoji: '🌻', name: 'Sunflower',   cost: 100 },
  { id: 'tulip',    emoji: '🌷', name: 'Tulip',       cost: 100 },
  { id: 'dog',      emoji: '🐶', name: 'Dog',         cost: 150 },
  { id: 'cat',      emoji: '🐱', name: 'Cat',         cost: 150 },
  { id: 'mouse',    emoji: '🐭', name: 'Mouse',       cost: 150 },
  { id: 'hamster',  emoji: '🐹', name: 'Hamster',     cost: 150 },
  { id: 'pizza',    emoji: '🍕', name: 'Pizza',       cost: 200 },
  { id: 'burger',   emoji: '🍔', name: 'Burger',      cost: 200 },
  { id: 'taco',     emoji: '🌮', name: 'Taco',        cost: 200 },
  { id: 'ramen',    emoji: '🍜', name: 'Ramen',       cost: 200 },
  { id: 'rocket',   emoji: '🚀', name: 'Rocket',      cost: 300 },
  { id: 'star',     emoji: '⭐', name: 'Star',        cost: 300 },
  { id: 'moon',     emoji: '🌙', name: 'Moon',        cost: 300 },
  { id: 'saturn',   emoji: '🪐', name: 'Saturn',      cost: 300 },
  { id: 'soccer',   emoji: '⚽', name: 'Soccer',      cost: 250 },
  { id: 'basketball',emoji:'🏀', name: 'Basketball',  cost: 250 },
  { id: 'tennis',   emoji: '🎾', name: 'Tennis',      cost: 250 },
  { id: 'football', emoji: '🏈', name: 'Football',    cost: 250 },
  { id: 'sun',      emoji: '☀️', name: 'Sun',         cost: 180 },
  { id: 'rainbow',  emoji: '🌈', name: 'Rainbow',     cost: 180 },
  { id: 'storm',    emoji: '⛈️', name: 'Storm',       cost: 180 },
  { id: 'snowflake',emoji: '❄️', name: 'Snowflake',   cost: 180 },
];

interface StepsContextValue {
  stepBalance: number;
  ownedStickerIds: string[];
  addSteps: (amount: number) => void;
  purchaseSticker: (stickerId: string) => boolean;
}

const StepsContext = createContext<StepsContextValue | null>(null);

const BALANCE_KEY = 'stepBalance';
const OWNED_KEY = 'ownedStickers';

export function StepsProvider({ children }: { children: React.ReactNode }) {
  const [stepBalance, setStepBalance] = useState(0);
  const [ownedStickerIds, setOwnedStickerIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [savedBalance, savedOwned] = await Promise.all([
        AsyncStorage.getItem(BALANCE_KEY),
        AsyncStorage.getItem(OWNED_KEY),
      ]);
      if (savedBalance !== null) setStepBalance(parseInt(savedBalance, 10));
      if (savedOwned !== null) setOwnedStickerIds(JSON.parse(savedOwned));
    })();
  }, []);

  function addSteps(amount: number) {
    setStepBalance(prev => {
      const next = prev + amount;
      AsyncStorage.setItem(BALANCE_KEY, String(next));
      return next;
    });
  }

  function purchaseSticker(stickerId: string): boolean {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker) return false;

    let canAfford = false;
    setStepBalance(prev => {
      if (prev < sticker.cost) return prev;
      canAfford = true;
      const next = prev - sticker.cost;
      AsyncStorage.setItem(BALANCE_KEY, String(next));
      return next;
    });

    if (!canAfford) return false;

    setOwnedStickerIds(prev => {
      const next = [...prev, stickerId];
      AsyncStorage.setItem(OWNED_KEY, JSON.stringify(next));
      return next;
    });
    return true;
  }

  return (
    <StepsContext.Provider value={{ stepBalance, ownedStickerIds, addSteps, purchaseSticker }}>
      {children}
    </StepsContext.Provider>
  );
}

export function useSteps() {
  const ctx = useContext(StepsContext);
  if (!ctx) throw new Error('useSteps must be used within StepsProvider');
  return ctx;
}
