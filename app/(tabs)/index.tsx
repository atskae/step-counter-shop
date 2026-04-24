import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Text, View } from '@/components/Themed';
import { useSteps } from '@/contexts/StepsContext';

export default function StepCounterScreen() {
  const [todaySteps, setTodaySteps] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const baselineRef = useRef(0);
  const { stepBalance, addSteps } = useSteps();

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    async function start() {
      const isAvailable = await Pedometer.isAvailableAsync();
      setAvailable(isAvailable);
      if (!isAvailable) return;

      // Load today's steps so far as a baseline
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(midnight, new Date());
        baselineRef.current = result.steps;
        setTodaySteps(result.steps);
      } catch {
        // getStepCountAsync not supported on all platforms — fall through to watchStepCount only
      }

      let lastCount = 0;
      subscription = Pedometer.watchStepCount(result => {
        const delta = result.steps - lastCount;
        lastCount = result.steps;
        if (delta > 0) {
          addSteps(delta);
          setTodaySteps(prev => prev + delta);
        }
      });
    }

    start();
    return () => subscription?.remove();
  }, []);

  const isSimulator = Platform.OS !== 'web' && available === false;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Today's Steps</Text>

      <View style={styles.circle}>
        <Text style={styles.stepCount}>{todaySteps.toLocaleString()}</Text>
        <Text style={styles.stepsWord}>steps</Text>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Step Balance</Text>
        <Text style={styles.balanceValue}>{stepBalance.toLocaleString()} 👟</Text>
      </View>

      {available === false && (
        <Text style={styles.unavailable}>
          {isSimulator
            ? 'Pedometer unavailable on simulator.\nSteps will track on a real device.'
            : 'Pedometer not available on this device.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepCount: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stepsWord: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 4,
  },
  balanceRow: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  unavailable: {
    fontSize: 13,
    opacity: 0.45,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
