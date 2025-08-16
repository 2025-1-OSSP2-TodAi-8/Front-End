import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, ViewStyle } from 'react-native';
import Svg, { Rect, Defs, ClipPath, G } from 'react-native-svg';

const BAR_WIDTH = 4;
const SPACING = 2;
const DEFAULT_HEIGHT = 40;

interface Props {
  decibel: number;     // -160 ~ 0
  style?: ViewStyle;
}

const WaveForm: React.FC<Props> = ({ decibel, style }) => {
  const [w, setW] = useState(0);
  const [h, setH] = useState(DEFAULT_HEIGHT);
  const [bars, setBars] = useState<number[]>([]);

  const gap = BAR_WIDTH + SPACING;
  const maxBars = useMemo(
    () => (w <= 0 ? 0 : Math.max(1, Math.floor(w / gap))),
    [w, gap]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.max(0, width));
    setH(height > 0 ? height : DEFAULT_HEIGHT);
  };

  useEffect(() => {
    if (!w || !h) return;
    const norm = Math.min(Math.max(decibel + 160, 0), 160);
    const usableH = Math.max(2, h - 4);
    const barH = Math.max(1, (norm / 160) * usableH);
    setBars(prev => {
      const next = [...prev, barH];
      // 메모리 보호용: 너무 길어지지 않게만 제한 (화면에 보이는 수의 3배 정도)
      const limit = Math.max(1, maxBars * 3 || 150);
      if (next.length > limit) next.shift();
      return next;
    });
  }, [decibel, w, h, maxBars]);

  // 오른쪽 정렬로 x 계산: 화면에 보일 마지막 maxBars개만 사용
  const visible = maxBars ? bars.slice(-maxBars) : [];
  const startX = Math.max(0, w - visible.length * gap);

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <Svg width={w} height={h}>
        <Defs>
          <ClipPath id="clip">
            <Rect x={0} y={0} width={w} height={h} rx={10} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#clip)">
          {visible.map((bh, i) => {
            const x = startX + i * gap;     // ← 오른쪽 끝부터 차오름
            const y = h - bh - 2;
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={bh}
                rx={2}
                fill="#531ea3"
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: DEFAULT_HEIGHT },
});

export default WaveForm;