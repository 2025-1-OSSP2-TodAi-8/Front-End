/* eslint-disable react-hooks/exhaustive-deps */
// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Main/MainScreen.tsx
// ───────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  View,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api/axios';

// React Navigation 훅·타입
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에 정의된 RootStackParamList를 import
import type { RootStackParamList } from '../../navigation/AppNavigator';

// 하위 컴포넌트들
import YearMonthSelector from './YearMonthSelector';
import CalendarGrid from './CalendarGrid';
import DiarySection from './DiarySection';

// 메뉴바 관련 컴포넌트
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import MenuBar from '../MenuBar/MenuBar';
import MenuIcon from '../MenuBar/MenuIcon';

type MainNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const emotionImageMap: { [key: string]: any } = {
  중립: require('../../assets/images/neutral.png'),
  놀람: require('../../assets/images/surprise.png'),
  화남: require('../../assets/images/angry.png'),
  행복: require('../../assets/images/happy.png'),
  슬픔: require('../../assets/images/sad.png'),
  혐오: require('../../assets/images/disgust.png'),
  공포: require('../../assets/images/fear.png'),
};

const MainScreen: React.FC<{
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}> = ({ setUserToken, setUserType }) => {
  const navigation = useNavigation<MainNavProp>();

  // (A) 내부 state: 년/월/선택일 + 감정 데이터 + 로딩 상태 + 메뉴바 열림 여부
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(5);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<{ date: string; emotion: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // MainScreen이 처음 마운트될 때 오늘 날짜의 연/월로 이동
  useEffect(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, []);


  // (C) 월별 감정 데이터를 서버에서 불러오는 함수 (API 인스턴스 사용)
 // (B) 로그아웃 콜백
const handleLogout = useCallback(async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  setUserToken(null);
  setUserType(null);
  setMenuVisible(false);
}, [setUserToken]);

// ✅ (C) useCallback으로 감싼 감정 데이터 요청 함수
const fetchMonthlyEmotions = useCallback(async () => {
  setLoading(true);
  try {
    const formattedMonth = String(month).padStart(2, '0');
    const url = `/api/diary/get_emotion_month/${year}-${formattedMonth}`;

    console.log('[📦 요청 URL]', url); // ✅ 콘솔에 year, month 포함한 최종 요청 경로 출력

    const res = await API.get(url);

    console.log('[전체]', res.data); 


    if (res.status === 200 && Array.isArray(res.data.data)) {
      console.log('[✅ 감정 데이터]', res.data.data); // ✅ 감정 배열 찍기
      setEmotionData(res.data.data);
    } else {
      setEmotionData([]);
    }
  } catch (error) {
    console.warn('월별 감정 불러오기 실패:', error);
    setEmotionData([]);
  } finally {
    setLoading(false);
  }
}, [month, year]);

// ✅ (D) 토큰 확인 후 최초 한 번만 데이터 요청
useEffect(() => {
  const checkTokenAndFetch = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      navigation.replace('LoginScreen');
    } else {
      fetchMonthlyEmotions();
    }
  };
  checkTokenAndFetch();
}, [fetchMonthlyEmotions, navigation]);

  // (E) 다이어리 섹션 헤더(날짜) 클릭 시 호출
  const handleDiaryPress = () => {
    if (!selectedDate) return;
    const emotionForDate =
      emotionData.find((item) => item.date === selectedDate)?.emotion ?? '';
      navigation.navigate('DiaryDetail', {
      date: selectedDate,
      emotion: emotionForDate,
      content: '',
      fromYear: year,
      fromMonth: month,
      fromDate: selectedDate,
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    // (F) 메뉴가 필요한 페이지는 WithMenuLayout으로 감싼다
    <WithMenuLayout setUserToken={setUserToken} setUserType={setUserType}>
      <SafeAreaView style={styles.container}>
        {/* (G) 메뉴가 닫혀 있을 때만 상단 좌측 햄버거 아이콘 표시 */}
        {!menuVisible && (
          <MenuIcon
            isOpen={false}
            onPress={() => setMenuVisible(true)}
          />
        )}

        {/* (H) 메뉴가 열렸으면 MenuBar 렌더링 */}
        {menuVisible && (
          <MenuBar
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            onFavorites={() => {
              setMenuVisible(false);
              navigation.navigate('Favorites');
            }}
            setUserToken={setUserToken}
            setUserType={setUserType}
            isOpen={menuVisible} // true → 메뉴바 안쪽 아이콘 90도 회전
            toggleMenu={() => setMenuVisible(false)}
          />
        )}

        {/* (I) 실제 페이지 콘텐츠: 연/월 선택 + 달력 + 일기 섹션 + 로딩 */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <YearMonthSelector
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />

          <CalendarGrid
            year={year}
            month={month}
            emotionData={emotionData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            emotionImageMap={emotionImageMap}
          />
          <DiarySection
            selectedDate={selectedDate}
            emotionData={emotionData}
            emotionImageMap={emotionImageMap}
            onPressHeader={handleDiaryPress}
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6A0DAD" />
              <Text style={styles.loadingText}>월별 감정을 불러오는 중...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </WithMenuLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E1FF',
    paddingHorizontal: 16,
    paddingTop: 60, // 메뉴 아이콘이 올라갈 공간 확보
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingOverlay: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
});

export default MainScreen;