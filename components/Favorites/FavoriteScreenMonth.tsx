// 파일: components/Favorites/FavoriteScreenMonth.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// React Navigation 훅
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에서 정의한 타입 import
import type { RootStackParamList } from '../../navigation/AppNavigator';



// “MonthDetail” 화면의 route prop 타입
type MonthDetailRouteProp = RouteProp<RootStackParamList, 'MonthDetail'>;
// “MonthDetail” 화면의 navigation prop 타입
type MonthDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'MonthDetail'>;

// 메뉴 아이콘·메뉴바 컴포넌트
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';

// emotion-box 아이콘 (경로는 프로젝트에 맞게 수정)
const folderIcon = require('../../assets/images/emotion-box.png');

// 감정 문자열 → 아이콘 이미지 매핑 (경로는 프로젝트에 맞게 수정)
const emotionImageMap: { [key: string]: any } = {
    중립: require('../../assets/images/neutral.png'),
    놀람: require('../../assets/images/surprise.png'),
    화남: require('../../assets/images/angry.png'),
    행복: require('../../assets/images/happy.png'),
    슬픔: require('../../assets/images/sad.png'),
    혐오: require('../../assets/images/disgust.png'),
    공포: require('../../assets/images/fear.png'),
};

type MonthEntry = {
    date: string;     // "YYYY-MM-DD"
    emotion: string;  // 예: "슬픔", "행복"
    summary: string;  // 요약 텍스트
};

const FavoriteScreenMonth: React.FC = () => {
    // 1) navigation · 2) route 훅 사용
    const navigation = useNavigation<MonthDetailNavProp>();
    const route = useRoute<MonthDetailRouteProp>();

    // route.params에서 전달된 year, month를 꺼냄
    const { year, month } = route.params;

    const [entries, setEntries] = useState<MonthEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // ─── (로그아웃 콜백) ───
    const handleLogout = useCallback(async (token: string | null) => {
        if (token === null) {
            await AsyncStorage.removeItem('accessToken');
            navigation.replace('LoginScreen');
        }
    }, [navigation]);

    // “월별 즐겨찾기” API 호출
    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://121.189.72.83:8888/api/diary/marked_month', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: 1, year, month }),
                });
                const json = await res.json();
                const data: MonthEntry[] = json.emotions.map((item: any) => ({
                    date: item.date,
                    emotion: item.emotion,
                    summary: item.summary,
                }));
                setEntries(data);
            } catch (err) {
                console.error('월별 즐겨찾기 불러오기 실패', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [year, month]);

    // “2025년 3월” 텍스트 클릭 시 이전 화면으로 돌아가기
    const handleBackToCalendar = () => {
        navigation.goBack();
    };
    // 우상단 emotion-box 아이콘 클릭 시 “Favorites” 화면으로 돌아가기
    const handleGoBackToFavorites = () => {
        navigation.navigate('Favorites');
    };

    // FlatList용 렌더 함수
    const renderEntry = ({ item }: { item: MonthEntry }) => {
        const [y, m, d] = item.date.split('-').map((str) => parseInt(str, 10));
        const formattedDate = `${y}년 ${m}월 ${d}일`;
        const iconSource = emotionImageMap[item.emotion] || null;

        return (
            <View style={styles.entryContainer}>
                {iconSource && <Image source={iconSource} style={styles.entryIcon} />}
                <View style={styles.entryTextContainer}>
                    <Text style={styles.entryDate}>{formattedDate}</Text>
                    <Text style={styles.entrySummary}>{item.summary}</Text>
                </View>
            </View>
        );
    };

    return (
        <WithMenuLayout setUserToken={handleLogout}>
            {/* (G) 이제는 MenuIcon을 항상 렌더링 */}
            <MenuIcon
                isOpen={menuVisible}               // menuVisible=false → 회전 0도, true → 회전 90도
                onPress={() => setMenuVisible((v) => !v)}
            />

            {/* (H) 메뉴가 열렸으면 MenuBar 렌더링 */}
            {menuVisible && (
                <MenuBar
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    onFavorites={() => {
                        setMenuVisible(false);
                        navigation.navigate('Favorites');
                    }}
                    setUserToken={handleLogout}
                    isOpen={menuVisible} // true → 메뉴바 안쪽 아이콘 90도 회전
                    toggleMenu={() => setMenuVisible(false)}
                />
            )}
            <SafeAreaView style={styles.monthContainer}>


                <ScrollView contentContainerStyle={styles.monthScroll}>
                    {/* ─── 헤더 영역 ─── */}
                    <View style={styles.headerContainer}>
                        {/* 1) “년 월” 텍스트: absolute로 전체 가로 폭 잡고 가운데 정렬 */}
                        <TouchableOpacity
                            style={styles.headerTextWrapper}
                            onPress={handleBackToCalendar}
                        >
                            <Text style={styles.headerText}>{`${year}년 ${month}월`}</Text>
                        </TouchableOpacity>

                        {/* 2) emotion-box 아이콘: absolute로 오른쪽에 고정 */}
                        <TouchableOpacity
                            style={styles.folderIconWrapper}
                            onPress={handleGoBackToFavorites}
                        >
                            <Image source={folderIcon} style={styles.folderIcon} />
                        </TouchableOpacity>
                    </View>
                    {/* ─────────────────────── */}

                    <Text style={styles.titleText}>즐겨찾기 한 감정</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />
                    ) : entries.length === 0 ? (
                        <Text style={styles.emptyText}>해당 월에 즐겨찾기된 감정이 없습니다.</Text>
                    ) : (
                        <FlatList
                            data={entries}
                            keyExtractor={(item) => item.date}
                            renderItem={renderEntry}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>
        </WithMenuLayout>
    );
};

const styles = StyleSheet.create({
    monthContainer: {
        flex: 1,
        backgroundColor: '#F5E8FF',
        paddingTop: 60, // SafeArea 이후 간격
    },
    monthScroll: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // ─── 헤더 ───
    headerContainer: {
        height: 40,             // 헤더 높이
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    // “년 월” 텍스트: absolute 포지션으로 가로 전체 잡고 중앙 정렬
    headerTextWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        marginBottom: 2,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        color: '#666',
        textDecorationLine: 'underline',
        marginTop: 40,
    },
    // emotion-box 아이콘: absolute로 오른쪽 끝에 고정
    folderIconWrapper: {
        position: 'absolute',
        right: 0,
        // vertical center 맞추려면 headerContainer 높이(40)의 중앙에 놓습니다.
        top: 29,
        bottom: 0,
        justifyContent: 'center',
        paddingRight: 8,
    },
    folderIcon: {
        width: 32,
        height: 32,
    },
    // ─────────────

    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#6A0DAD',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 40,
    },
    entryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    entryIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    entryTextContainer: {
        flex: 1,
    },
    entryDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B148F',
        marginBottom: 4,
    },
    entrySummary: {
        fontSize: 14,
        color: '#555555',
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
        marginTop: 40,
    },
});

export default FavoriteScreenMonth;