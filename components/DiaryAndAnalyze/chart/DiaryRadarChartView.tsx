// components/DiaryAndAnalyze/emotion/DiaryRadarChartView.tsx
import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import SpiderGraph from "./SpiderGraph";

const screenWidth = Dimensions.get("window").width;

interface DiaryRadarChartViewProps {
    // API 응답: [놀람, 화남, 행복, 슬픔, 혐오, 공포]
    emotion?: number[];
    text?: string;
}

// 화면에 그릴 레이블 (기쁨 대신 '화남'부터 6개)
const emotionLabels = ["화남", "슬픔", "혐오", "행복", "공포", "놀람"];
// API 순서
const apiOrder = ["놀람", "화남", "행복", "슬픔", "혐오", "공포"];

const DiaryRadarChartView: React.FC<DiaryRadarChartViewProps> = ({
    emotion,
    text,
}) => {
    // 1) emotion이 6개 숫자로 되어 있는지 검사
    const safeEmotion: number[] =
        Array.isArray(emotion) && emotion.length === apiOrder.length
            ? emotion.map((v) => (typeof v === "number" && !isNaN(v) ? v : 0))
            : [0, 0, 0, 0, 0, 0];

    // 2) SpiderGraph에 들어갈 데이터 포맷으로 변환 ({화남:0~100, 슬픔:0~100, …})
    const transformedData = [
        emotionLabels.reduce((acc, label) => {
            const idx = apiOrder.indexOf(label);
            const rawValue = idx !== -1 && safeEmotion.length > idx ? safeEmotion[idx] : 0;
            acc[label] = rawValue * 100; // 0~100 스케일
            return acc;
        }, {} as { [key: string]: number }),
    ];

    // 3) SpiderGraph 옵션
    const maxValue = 100;
    const chartOptions = {
        colorList: ["#6A0DAD"],
        dotList: [false],
        scaleCount: 5,
        numberInterval: 20,
    };

    return (
        <View style={styles.container}>
            <SpiderGraph
                data={transformedData}
                graphSize={screenWidth - 40}
                options={{
                    ...chartOptions,
                    max: maxValue
                }}
            />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

export default DiaryRadarChartView;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginTop: -170,
    },
    text: {
        fontSize: 16,
        marginTop: 12,
        color: "#333",
        textAlign: "center",
    },
});