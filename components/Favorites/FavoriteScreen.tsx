// 파일명: FavoritesScreen.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
} from 'react-native';

// React Navigation 훅
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에서 정의한 RootStackParamList 타입을 import
import type { RootStackParamList } from '../../navigation/AppNavigator';

// FavoritesScreen에서 사용할 navigation prop 타입 정의
type FavoritesNavProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

// 메뉴 아이콘·메뉴바 컴포넌트
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';

// 타이틀 옆에 표시할 폴더 아이콘 (경로는 프로젝트에 맞게 수정)
const folderIcon = require('../../assets/images/emotion-box.png');

// 월 이름 배열 (index 0 → 1월, 1 → 2월, …)
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

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

const FavoritesScreen: React.FC = () => {
    // 네비게이션 객체 가져오기
    const navigation = useNavigation<FavoritesNavProp>();

    // 상태: 연도, 월별 감정맵, 메뉴바 표시 여부
    const [year, setYear] = useState<number>(2025);
    const [emotionMap, setEmotionMap] = useState<{ [key: string]: string[] }>({});
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // 연도가 바뀔 때마다 API 호출하여 해당 연도 전체의 Month별 감정 정보 가져오기
    useEffect(() => {
        const fetchYearlyEmotion = async () => {
            try {
                const res = await fetch(
                    'http://121.189.72.83:8888/api/diary/marked_year',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ year }),
                    }
                );
                const json = await res.json();
                const monthlyMap = getMonthlyEmotionMap(json.emotions);
                setEmotionMap(monthlyMap);
            } catch (err) {
                console.error('연도별 감정 불러오기 실패', err);
            }
        };
        fetchYearlyEmotion();
    }, [year]);

    // API에서 받은 리스트를 “월별로 최대 4개” 형태의 맵(딕셔너리)으로 변환
    const getMonthlyEmotionMap = (
        emotionList: { date: string; emotion: string }[]
    ): { [key: string]: string[] } => {
        const map: { [key: string]: string[] } = {};
        for (const { date, emotion } of emotionList) {
            // date 예) "2025-03-15" → toLocaleString으로 "Mar"
            const monthStr = new Date(date).toLocaleString('en-US', { month: 'short' });
            if (!map[monthStr]) {
                map[monthStr] = [];
            }
            if (map[monthStr].length < 4) {
                map[monthStr].push(emotion);
            }
        }
        return map;
    };

    return (
        <View style={styles.container}>
            {/* ─── 메뉴 아이콘 (좌상단) ─── */}
            <MenuIcon onPress={() => setMenuVisible(true)} />

            {/* ─── 메뉴바 ─── */}
            <MenuBar
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onFavorites={() => {
                    setMenuVisible(false);
                    // 이미 이 화면이 “즐겨찾기 메인”이므로 추가 동작은 없어도 됩니다.
                }}
            />

            {/* ─── 타이틀 영역 ─── */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>감정 보관함</Text>
                <Image
                    source={folderIcon}
                    style={styles.titleImage}
                    resizeMode="contain"
                />
            </View>

            {/* ─── 연도 변경 버튼 ─── */}
            <View style={styles.yearRow}>
                <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
                    <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}년</Text>
                <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
                    <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>

            {/* ─── 월별 카드 그리드 ─── */}
            <FlatList
                data={months}
                numColumns={2}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.grid}
                renderItem={({ item, index }) => {
                    // index 0→1월, 1→2월, …, 11→12월
                    const monthNumber = index + 1;
                    const emotionList: string[] = emotionMap[item] || [];

                    return (
                        <TouchableOpacity
                            style={styles.itemContainer}
                            activeOpacity={0.7}
                            // 월(item)을 누르면 “MonthDetail” 화면으로 이동
                            onPress={() =>
                                navigation.navigate('MonthDetail', {
                                    year: year,
                                    month: monthNumber,
                                })
                            }
                        >
                            <View style={styles.monthCard}>
                                <View style={styles.innerGrid}>
                                    {emotionList.slice(0, 4).map((emo, idx) => {
                                        const imgSrc = emotionImageMap[emo];
                                        if (!imgSrc) return null;
                                        return (
                                            <Image
                                                key={idx}
                                                source={imgSrc}
                                                style={styles.smallEmotionImage}
                                                resizeMode="contain"
                                            />
                                        );
                                    })}
                                </View>
                            </View>
                            <Text style={styles.monthText}>{item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5E8FF',
        paddingTop: 90, // 메뉴 아이콘이 떠 있을 충분한 여유
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6A0DAD',
    },
    titleImage: {
        width: 28,
        height: 28,
        marginLeft: 8,
    },
    yearRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'center',
    },
    arrow: {
        fontSize: 24,
        color: '#6A0DAD',
        marginHorizontal: 16,
    },
    yearText: {
        fontSize: 20,
        color: '#6A0DAD',
        fontWeight: 'bold',
    },
    grid: {
        paddingHorizontal: 16,
    },
    itemContainer: {
        flex: 1,
        margin: 8,
        alignItems: 'center',
    },
    monthCard: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F5E8FF',
        borderWidth: 2,
        borderColor: '#B39DDB',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerGrid: {
        width: '90%',
        height: '90%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallEmotionImage: {
        width: '45%',
        height: '45%',
        margin: '2.5%',
    },
    monthText: {
        marginTop: 8,
        fontSize: 18,
        color: '#6A0DAD',
        fontWeight: 'bold',
    },
});

export default FavoritesScreen;
