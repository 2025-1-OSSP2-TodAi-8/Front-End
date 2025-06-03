// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/DiaryAndAnalyze/DiaryAndAnalyzeScreen.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import API from '../../api/axios'; // axios 인스턴스
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Navigation 훅·타입
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에 정의된 RootStackParamList import
import type { RootStackParamList } from '../../navigation/AppNavigator';

// 하위 컴포넌트들
import DiaryEmotionView from './emotion/DiaryEmotionView';
import DiaryRadarChartView from './chart/DiaryRadarChartView';
import DiaryDetailActions from './actions/DiaryDetailActions';

// 메뉴바 관련 컴포넌트
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';
import WithMenuLayout from '../MenuBar/MenuBarLayout';

Dimensions.get('window');

// 일별 조회용 API 엔드포인트 (baseURL은 API 인스턴스가 붙여줍니다)
const EMOTION_DAY_PATH = '/api/emotion/day';

const DiaryAndAnalyzeScreen: React.FC = () => {
    // 네비게이션 & 라우트 훅
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'DiaryDetail'>>();
    const route = useRoute<RouteProp<RootStackParamList, 'DiaryDetail'>>();

    // route.params로 넘어온 값 꺼내기
    const { date: initialDate } = route.params;

    // ─── (1) 메뉴바 열림 여부 상태 ───
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // ─── (2) "일별 조회" 관련 상태 ───
    const [showChart, setShowChart] = useState<boolean>(false);
    const [currentDate, setCurrentDate] = useState<string>(initialDate);
    const [todayEmotion, setTodayEmotion] = useState<{
        emotion: string;
        emotion_rate: number[];
        summary?: string;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // ─── (3) 로그아웃 콜백 (WithMenuLayout → MenuBar 전달) ───
    const handleLogout = useCallback(async () => {
        await AsyncStorage.removeItem('accessToken');
        // 로그아웃 시 무조건 로그인 화면으로 리다이렉트
        navigation.replace('LoginScreen');
    }, [navigation]);

    // ─── (4) "일별 감정 조회" 함수 (API 인스턴스 사용) ───
    const fetchOneDayEmotion = async (year: number, month: number, day: number) => {
        try {
            const response = await API.post(EMOTION_DAY_PATH, {
                year,
                month,
                day,
            });
            if (response.status === 200 && response.data) {
                const data = response.data;
                return {
                    emotion: data.emotion || '',
                    emotion_rate: Array.isArray(data.emotion_rate)
                        ? data.emotion_rate
                        : [0, 0, 0, 0, 0, 0, 0],
                    summary: data.summary ?? '',
                };
            } else {
                return null;
            }
        } catch (err) {
            console.error('일별 감정 조회 실패:', err);
            return null;
        }
    };

    // ─── (5) currentDate가 바뀔 때마다 "일별 감정 조회" 수행 ───
    useEffect(() => {
        const [yStr, mStr, dStr] = currentDate.split('-');
        const y = Number(yStr), m = Number(mStr), d = Number(dStr);

        setLoading(true);
        fetchOneDayEmotion(y, m, d)
            .then((data) => {
                if (data) {
                    setTodayEmotion({
                        emotion: data.emotion,
                        emotion_rate: data.emotion_rate,
                        summary: data.summary,
                    });
                } else {
                    // 데이터가 없거나 실패 시 기본값 세팅
                    setTodayEmotion({
                        emotion: '',
                        emotion_rate: [0, 0, 0, 0, 0, 0, 0],
                        summary: '',
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [currentDate]);

    // ─── (6) 날짜 이동 함수 ───
    const onPrevDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d.toISOString().slice(0, 10)); // "YYYY-MM-DD" 형태
    };
    const onNextDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d.toISOString().slice(0, 10));
    };

    // ─── (7) 상단 텍스트 클릭 시 돌아가기 ───
    const onDatePress = () => {
        navigation.navigate('Main');
    };

    // ─── 상단에 표시할 포맷된 날짜 문자열 ───
    const [yStr, mStr, dStr] = currentDate.split('-');
    const formattedDate = `${yStr}년 ${parseInt(mStr, 10)}월 ${parseInt(dStr, 10)}일`;

    function setUserToken(_token: string | null): void {
        throw new Error('Function not implemented.');
    }

    // ─────────────────────────────────────────────────────────────────────
    return (
        <WithMenuLayout setUserToken={handleLogout}>
            {/* (G) 이제는 MenuIcon을 항상 렌더링 */}
            <MenuIcon
                isOpen={menuVisible}               // menuVisible=false → 회전 0도, true → 회전 90도
                onPress={() => setMenuVisible((v) => !v)}
            />

            {menuVisible && (
                <MenuBar
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    onFavorites={() => {
                        setMenuVisible(false);
                        navigation.navigate('Favorites');
                    }}
                    setUserToken={setUserToken}
                    isOpen={menuVisible}             // true 상태면 MenuBar 내부 아이콘도 90도 회전
                    toggleMenu={() => setMenuVisible(false)}
                />
            )}

            <SafeAreaView style={styles.container}>
                <View style={styles.headerWrapper}>
                    {/* 메뉴가 닫혀 있을 때만 햄버거 아이콘 표시 (위쪽) */}
                    {/* TodAi 대신 "날짜"를 중앙에 배치 */}
                    <TouchableOpacity onPress={onDatePress}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </TouchableOpacity>
                </View>



                {/* ─── (10) 부제목 & 차트 토글 영역 ─── */}
                <View style={styles.subHeaderWrapper}>
                    <Text style={styles.subtitleText}>오늘의 감정 상태는…</Text>
                </View>
                {/* 차트 <-> 감정뷰 전환 아이콘 */}
                <TouchableOpacity
                    onPress={() => setShowChart((prev) => !prev)}
                    style={styles.chartToggleWrapper}
                >
                    {/* showChart 상태에 따라 다른 이미지를 렌더링 */}
                    <Image
                        source={
                            showChart
                                ? require('../../assets/images/emotion.png')
                                : require('../../assets/images/Chart.png')
                        }
                        style={styles.chartToggleIcon}
                    />
                </TouchableOpacity>

                {/* ─── (11) 본문: 로딩 중일 때는 인디케이터, 아니면 차트 / 감정뷰 ─── */}
                <View style={styles.bodyWrapper}>
                    {loading || !todayEmotion ? (
                        <ActivityIndicator size="large" color="#6A0DAD" />
                    ) : showChart ? (
                        <DiaryRadarChartView
                            emotion={todayEmotion.emotion_rate}
                            text={todayEmotion.summary ?? ''}
                        />
                    ) : (
                        <DiaryEmotionView
                            emotion={todayEmotion.emotion}
                            text={todayEmotion.summary ?? ''}
                            onPrevDate={onPrevDate}
                            onNextDate={onNextDate}
                            currentDate={currentDate}
                        />
                    )}
                </View>

                {/* ─── (12) 하단 액션바 (즐겨찾기 / 저장 등) ─── */}
                <View style={styles.actionsWrapper}>
                    <DiaryDetailActions date={currentDate} />
                </View>
            </SafeAreaView>
        </WithMenuLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5E8FF',
    },
    // ────────────────────────────────────────────────────────────
    headerWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // 날짜 텍스트를 화면 가로 중앙에 배치
        marginTop: 100,            // 맨 위 여백 (상태 표시줄 아래 여유)
        position: 'relative',
    },
    dateText: {
        fontSize: 14,
        color: '#B0B0B0', // 연한 회색
    },
    // ────────────────────────────────────────────────────────────
    subHeaderWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 20,
        color: '#6A0DAD',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    chartToggleWrapper: {
        position: 'absolute',
        top: 80,    // headerWrapper 아래쪽에 살짝 겹치게 위치
        right: 35,   // 우측 여백
        zIndex: 10,
    },
    chartToggleIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    // ────────────────────────────────────────────────────────────
    bodyWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // ────────────────────────────────────────────────────────────
    actionsWrapper: {
        width: '100%',
        paddingBottom: 20,
    },
});

export default DiaryAndAnalyzeScreen;