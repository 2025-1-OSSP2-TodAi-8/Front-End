// 파일: components/DiaryAndAnalyze/DiaryAndAnalyzeScreen.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import axios from 'axios';

// React Navigation 훅·타입
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에 정의된 RootStackParamList import (경로는 프로젝트 구조에 맞게 수정)
import type { RootStackParamList } from '../../navigation/AppNavigator';

// 하위 컴포넌트들
import DiaryEmotionView from './emotion/DiaryEmotionView';
import DiaryRadarChartView from './chart/DiaryRadarChartView';
import DiaryDetailActions from './actions/DiaryDetailActions';

// 새로 추가: MenuIcon, MenuBar (경로를 실제 위치에 맞게 수정)
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';

// ─── “일별 감정 조회” 전용 타입 정의 ───
// 네비게이터에서 “DiaryDetail”로 넘어올 때 받는 param 타입
type DiaryDetailRouteProp = RouteProp<RootStackParamList, 'DiaryDetail'>;
type DiaryDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'DiaryDetail'>;
// ────────────────────────────────────────

// 일별 조회용 API 엔드포인트
const EMOTION_DAY_API = 'http://121.189.72.83:8888/api/emotion/day';

const DiaryAndAnalyzeScreen: React.FC = () => {
    // 네비게이션 & 라우트 훅
    const navigation = useNavigation<DiaryDetailNavProp>();
    const route = useRoute<DiaryDetailRouteProp>();

    // route.params로 넘어온 값 꺼내기
    // (AppNavigator의 RootStackParamList에 정의된 필드와 정확히 일치해야 합니다)
    const { date: initialDate, fromYear, fromMonth, fromDate } = route.params;

    // 메뉴바 열림 여부 상태
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // 감정 조회 vs 차트 토글
    const [showChart, setShowChart] = useState<boolean>(false);

    // 현재 보고 있는 날짜(YYYY-MM-DD)
    const [currentDate, setCurrentDate] = useState<string>(initialDate);

    // 서버에서 받아온 이 달(month)의 모든 감정 데이터 (사용하지 않음, 우린 “일별 조회”만 쓸 예정)
    const [monthlyData, setMonthlyData] = useState<any[]>([]);

    // “일별 조회” 결과(Emotion + emotion_rate 배열 + text)
    const [todayEmotion, setTodayEmotion] = useState<{
        emotion: string;
        emotion_rate: number[];
        text?: string;
    } | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    // ─── “일별 감정 조회” 함수 ───
    async function fetchOneDayEmotion(year: number, month: number, day: number) {
        try {
            const res = await fetch(EMOTION_DAY_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, month, day }),
            });
            const json = await res.json();
            // 응답 형식 예시:
            // {
            //   "date": "2024-05-01",
            //   "emotion": "화남",
            //   "emotion_rate": [0.0,0.0,0.0,1.0,0.0,0.0,0.0]
            // }
            return json;
        } catch (err) {
            console.error('일별 감정 조회 실패:', err);
            return null;
        }
    }

    // “currentDate”가 바뀔 때마다 다시 조회
    useEffect(() => {
        const [yStr, mStr, dStr] = currentDate.split('-');
        const y = Number(yStr), m = Number(mStr), d = Number(dStr);

        setLoading(true);
        fetchOneDayEmotion(y, m, d).then((data) => {
            if (data) {
                setTodayEmotion({
                    emotion: data.emotion || '',
                    emotion_rate: Array.isArray(data.emotion_rate) ? data.emotion_rate : [0, 0, 0, 0, 0, 0, 0],
                    text: data.text ?? '',
                });
            } else {
                // 조회 실패 또는 데이터 없음
                setTodayEmotion({
                    emotion: '',
                    emotion_rate: [0, 0, 0, 0, 0, 0, 0],
                    text: '',
                });
            }
        }).finally(() => setLoading(false));
    }, [currentDate]);

    // 날짜 이동 함수 (전일/익일)
    const onPrevDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d.toISOString().slice(0, 10));
    };
    const onNextDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d.toISOString().slice(0, 10));
    };

    // “날짜 텍스트” 클릭 시 캘린더(메인) 화면으로 돌아가기
    const onDatePress = () => {
        navigation.goBack();
        // 만약 “year/month/date”를 Main으로 명시 전달하고 싶다면 아래처럼:
        // navigation.navigate('Main', { year: fromYear, month: fromMonth, selectedDate: fromDate });
    };

    // 화면 상단에 띄워줄 포맷된 날짜 문자열
    const [y, m, d] = currentDate.split('-');
    const formattedDate = `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;

    return (
        <View style={styles.container}>
            {/* ─── 재사용 가능한 메뉴 아이콘 ─── */}
            <View style={styles.menuIconWrapper}>
                <MenuIcon onPress={() => setMenuVisible(true)} />
            </View>
            {/* ───────────────────────────────── */}

            {/* 메뉴바 */}
            <MenuBar
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onFavorites={() => {
                    setMenuVisible(false);
                    navigation.navigate('Favorites');
                }}
            />

            {/* 상단 헤더 (날짜 + 부제) */}
            <View style={styles.headerWrapper}>
                <TouchableOpacity onPress={onDatePress} activeOpacity={0.7}>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </TouchableOpacity>
                <Text style={styles.subtitleText}>오늘의 감정상태는...</Text>
            </View>

            {/* 차트 토글 버튼 (우상단) */}
            <View style={styles.chartToggleWrapper}>
                <TouchableOpacity onPress={() => setShowChart(prev => !prev)}>
                    <Image
                        source={
                            showChart
                                ? require('../../assets/images/emotion.png')
                                : require('../../assets/images/Chart.png')
                        }
                        style={styles.chartToggleIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* 메인 영역: 로딩 또는 차트 / 감정뷰 */}
            <View style={styles.bodyWrapper}>
                {loading || !todayEmotion ? (
                    <ActivityIndicator size="large" color="#6A0DAD" />
                ) : showChart ? (
                    // “emotion_rate” 배열을 RadarChart에 그대로 넘겨줍니다.
                    <DiaryRadarChartView
                        emotion={todayEmotion.emotion_rate}
                        text={todayEmotion.text ?? ''}
                    />
                ) : (
                    <DiaryEmotionView
                        emotion={todayEmotion.emotion}
                        text={todayEmotion.text ?? ''}
                        onPrevDate={onPrevDate}
                        onNextDate={onNextDate}
                    />
                )}
            </View>

            {/* 하단 액션바 (즐겨찾기/저장) */}
            <View style={styles.actionsWrapper}>
                <DiaryDetailActions date={currentDate} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5E8FF',
    },
    headerWrapper: {
        paddingTop: 100,       // 상단 여백
        alignItems: 'center',  // 중앙 정렬
        marginBottom: 12,
    },
    dateText: {
        color: '#888',
        fontSize: 18,
        fontWeight: '400',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitleText: {
        color: '#6A0DAD',
        fontSize: 20,
        fontWeight: 'bold',
    },
    chartToggleWrapper: {
        position: 'absolute',
        top: 75,
        right: 35,
        zIndex: 10,
    },
    chartToggleIcon: {
        width: 28,
        height: 28,
    },
    bodyWrapper: {
        flex: 1,
    },
    actionsWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default DiaryAndAnalyzeScreen;
