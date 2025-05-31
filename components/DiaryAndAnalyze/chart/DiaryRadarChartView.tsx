import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

const emotionLabels = ['중립', '놀람', '화남', '행복', '슬픔', '혐오', '공포'];
const screenWidth = Dimensions.get('window').width;

interface DiaryRadarChartViewProps {
    emotion: number[];
    text: string;
}

const RadarChart: React.FC<{ data: number[]; labels: string[]; size: number }> = ({ data, labels, size }) => {
    const center = size / 2;
    const radius = size / 2 - 30;
    const angleStep = (2 * Math.PI) / labels.length;
    const maxValue = Math.max(1, ...data);

    // 각 축의 끝점 좌표 계산
    const points = labels.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    });

    // 데이터 값에 따른 좌표 계산
    const dataPoints = data.map((v, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (v / maxValue) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    });

    // SVG Polygon 포맷
    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <Svg width={size} height={size}>
            {/* 축선 */}
            {points.map((p, i) => (
                <Line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={p.x}
                    y2={p.y}
                    stroke="#ccc"
                    strokeWidth={1}
                />
            ))}
            {/* 외곽선 */}
            <Polygon
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#aaa"
                strokeWidth={2}
            />
            {/* 데이터 영역 */}
            <Polygon
                points={dataPolygon}
                fill="#6A0DAD55"
                stroke="#6A0DAD"
                strokeWidth={2}
            />
            {/* 꼭짓점 점 */}
            {dataPoints.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={4} fill="#6A0DAD" />
            ))}
            {/* 라벨 */}
            {points.map((p, i) => (
                <SvgText
                    key={i}
                    x={p.x}
                    y={p.y - 10}
                    fontSize="14"
                    fontWeight="bold"
                    fill="#34495E"
                    textAnchor="middle"
                >
                    {labels[i]}
                </SvgText>
            ))}
        </Svg>
    );
};

const DiaryRadarChartView: React.FC<DiaryRadarChartViewProps> = ({ emotion, text }) => {
    // emotion이 undefined이거나 배열이 아니면 기본값으로 대체
    const safeEmotion = Array.isArray(emotion) ? emotion : [0, 0, 0, 0, 0, 0, 0];

    return (
        <View style={styles.container}>
            <RadarChart data={safeEmotion.slice(0, 7)} labels={emotionLabels} size={screenWidth - 40} />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        marginTop: 16,
        color: '#333',
        textAlign: 'center',
    },
});

export default DiaryRadarChartView;