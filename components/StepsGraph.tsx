import { useState } from 'react';
import { View, Text } from 'react-native';

const GRAPH_HEIGHT = 48;
const DAYS = 14;
const PAD = 12;

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function LineSegment({
  x1, y1, x2, y2, strokeWidth, opacity,
}: {
  x1: number; y1: number; x2: number; y2: number;
  strokeWidth: number; opacity: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <View
      style={{
        position: 'absolute',
        width: length,
        height: strokeWidth,
        backgroundColor: '#4CAF50',
        opacity,
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - strokeWidth / 2,
        transform: [{ rotate: `${angle}deg` }],
        borderRadius: strokeWidth,
      }}
    />
  );
}

interface Props {
  dailySteps: Record<string, number>;
  streakDays: number;
}

export default function StepsGraph({ dailySteps, streakDays }: Props) {
  const [width, setWidth] = useState(0);

  const dates = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return d;
  });

  const days = dates.map(d => toDateKey(d));
  const values = days.map(d => dailySteps[d] || 0);
  const max = Math.max(...values, 1);
  const innerWidth = width - PAD * 2;

  const pts = values.map((v, i) => ({
    x: PAD + (width > 0 ? (i / (DAYS - 1)) * innerWidth : 0),
    y: GRAPH_HEIGHT - (v / max) * (GRAPH_HEIGHT * 0.85),
    isStreak: i >= DAYS - streakDays,
    hasSteps: v > 0,
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dates[i].getDay()],
    isToday: i === DAYS - 1,
  }));

  return (
    <View
      style={{ width: '100%' }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: PAD }}>
        {pts.map((pt, i) => (
          <Text
            key={`label-${i}`}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              opacity: pt.isToday ? 0.8 : pt.isStreak ? 0.55 : 0.3,
              fontWeight: pt.isToday || pt.isStreak ? '700' : '400',
            }}
          >
            {pt.dayName}
          </Text>
        ))}
      </View>

      <View style={{ height: GRAPH_HEIGHT, width: '100%', position: 'relative' }}>

      {width > 0 && pts.slice(0, -1).map((pt, i) => {
        const next = pts[i + 1];
        const isStreakSeg = pt.isStreak && next.isStreak;
        return (
          <LineSegment
            key={`seg-${i}`}
            x1={pt.x} y1={pt.y}
            x2={next.x} y2={next.y}
            strokeWidth={isStreakSeg ? 3 : 1.5}
            opacity={isStreakSeg ? 0.6 : 0.3}
          />
        );
      })}

      {width > 0 && pts.map((pt, i) =>
        pt.hasSteps ? (
          <View
            key={`dot-${i}`}
            style={{
              position: 'absolute',
              width: pt.isStreak ? 6 : 4,
              height: pt.isStreak ? 6 : 4,
              borderRadius: 3,
              backgroundColor: '#4CAF50',
              opacity: pt.isStreak ? 0.7 : 0.4,
              left: pt.x - (pt.isStreak ? 3 : 2),
              top: pt.y - (pt.isStreak ? 3 : 2),
            }}
          />
        ) : null
      )}
      </View>
    </View>
  );
}
