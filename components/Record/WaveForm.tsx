// WaveformAnimated.tsx
import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const MAX_BARS = 50;
const BAR_WIDTH = 4;
const SPACING = 2;

interface WaveformAnimatedProps {
  decibel: number;
}

const WaveformAnimated: React.FC<WaveformAnimatedProps> = ({ decibel }) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const normalized = Math.min(Math.max(decibel + 160, 0), 160);
    const height = (normalized / 160) * 80;

    setBars(prev => {
      const updated = [...prev, height];
      if (updated.length > MAX_BARS) updated.shift();
      return updated;
    });
  }, [decibel]);

  return (
    <View style={styles.container}>
      <Svg height="80" width={width - 40}>
        {bars.map((h, i) => (
          <Rect
            key={i}
            x={i * (BAR_WIDTH + SPACING)}
            y={80 - h}
            width={BAR_WIDTH}
            height={h}
            fill="#531ea3"
            rx={2}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
});

export default WaveformAnimated;
