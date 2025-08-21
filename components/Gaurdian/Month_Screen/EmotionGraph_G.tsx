// EmotionGraph_G.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

export interface EmotionStats {
  happy: number; sadness: number; anger: number;
  surprise: number; fear: number; disgust: number;
  unknown: number; total: number;
}
interface Props { stats: EmotionStats | null; ym: string; targetId: string; }

const screenWidth = Dimensions.get('window').width;
const COLS = 4;
const CELL_W = Math.floor((screenWidth - 32) / COLS);

const COLORS: Record<string, string> = {
  행복: '#F9E79F', 놀람: '#A3E4D7', 슬픔: '#AED6F1',
  화남: '#F5B7B1', 혐오: '#ABEBC6', 공포: '#D2B4DE',
};

// 헥사 → rgba (투명도)
function withAlpha(hex: string, alpha: number) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const EMOTION_INDEX: Record<string, number> = {
  행복: 0, 슬픔: 1, 화남: 2, 놀람: 3, 공포: 4, 혐오: 5,
};

const EmotionGraph_G: React.FC<Props> = ({ stats, ym, targetId }) => {
  // ✅ 훅은 항상 최상단에서 호출
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const navigation = useNavigation<any>();

  // ✅ stats 유무와 상관없이 항상 호출
  const data = useMemo(() => {
    if (!stats) return { raw: [] as {label:string; value:number; color:string}[], total: 0, labels: [] as string[] };

    const rawAll = [
      { label: '행복', value: stats.happy,    color: COLORS['행복'] },
      { label: '슬픔', value: stats.sadness,  color: COLORS['슬픔'] },
      { label: '화남', value: stats.anger,    color: COLORS['화남'] },
      { label: '놀람', value: stats.surprise, color: COLORS['놀람'] },
      { label: '공포', value: stats.fear,     color: COLORS['공포'] },
      { label: '혐오', value: stats.disgust,  color: COLORS['혐오'] },
    ].filter(d => d.value > 0);

    const total =
      (stats.total && stats.total > 0) ? stats.total : rawAll.reduce((a, b) => a + b.value, 0);

    if (!total) return { raw: [], total: 0, labels: [] };

    const labels = rawAll.map(d => `${Math.round((d.value / total) * 100)}%`);
    return { raw: rawAll, total, labels };
  }, [stats]);

  // ✅ 여기서 분기(모든 훅 호출 후)
  if (data.total === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>이번 달 기록된 감정이 없습니다.</Text>
      </View>
    );
  }

  const targetW = 700, targetH = 350;
  const width  = Math.min(screenWidth - 32, targetW);
  const radius = Math.min(width, targetH) * 0.38;

  const pieData = data.raw.map((d, i) => {
    const isActive = selected === i || (selected === null && hovered === i);
    const dimOthers =
      (selected !== null && selected !== i) ||
      (selected === null && hovered !== null && hovered !== i);

    const label = d.label; // '행복' 등
    const idx = EMOTION_INDEX[label];
    const canNavigate = typeof idx === 'number';

    return {
      value: d.value,
      color: dimOthers ? withAlpha(d.color, 0.4) : d.color,
      text: data.labels[i],
      textColor: isActive ? '#111' : '#555',
      textSize: isActive ? 14 : 12,
      onPress: () => {
        if (!canNavigate) return;
        navigation.navigate('EmotionDiaryList', {
          ym,
          emotionIndex: idx,
          emotionLabel: label,
          targetId,
        });
      },
    };
  });

  return (
    <View style={styles.wrapper}>
      {/* 차트 컨테이너 */}
      <View
        style={[
          styles.chartBox,
          { width: radius * 2, height: radius * 2 },
        ]}
      >
        <PieChart
          data={pieData}
          radius={radius}
          donut={false}
          innerRadius={0}
          showText
          textColor="#333"
          textSize={12}
          centerLabelComponent={() => null}
          animationDuration={300}
        />

        {/* 3D 느낌 오버레이 */}
        <Svg
          width={radius * 2}
          height={radius * 2}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient id="shine" cx="30%" cy="30%" r="70%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset="60%"  stopColor="#FFFFFF" stopOpacity={0.08} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
            </RadialGradient>
          </Defs>
          <Circle cx={radius} cy={radius} r={radius} fill="url(#shine)" />
          <Circle cx={radius} cy={radius} r={radius - 2} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={6} />
        </Svg>
      </View>

      {/* 범례 3×2 */}
      <View style={styles.legendGrid}>
        {data.raw.map((d, i) => {
          const isActive = selected === i || (selected === null && hovered === i);
          const dimOthers =
            (selected !== null && selected !== i) ||
            (selected === null && hovered !== null && hovered !== i);

          return (
            <Pressable
              key={d.label}
              style={[styles.legendCell, isActive && styles.legendHovered]}
              onPressIn={() => setHovered(i)}
              onPressOut={() => setHovered(null)}
              onPress={() => setSelected(prev => (prev === i ? null : i))}
            >
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: d.color, opacity: dimOthers ? 0.5 : 1 },
                ]}
              />
              <Text
                style={[
                  styles.legendLabel,
                  { opacity: dimOthers ? 0.6 : 1, fontWeight: isActive ? '700' : '400' },
                ]}
              >
                {d.label} {data.labels[i]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'transparent', paddingVertical: 20 },
  chartBox: {
    position: 'relative',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  legendGrid: {
    width: screenWidth - 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
    gap: 4,
    marginBottom: 30,
  },
  legendCell: {
    width: CELL_W,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  legendHovered: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { fontSize: 13, color: '#222' },
  emptyBox: { backgroundColor: 'transparent', padding: 8, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 12 },
});

export default EmotionGraph_G;
