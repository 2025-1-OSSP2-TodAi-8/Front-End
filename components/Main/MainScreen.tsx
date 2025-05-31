// 파일: components/Main/MainScreen.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  View,
  Text,
} from 'react-native';
import axios from 'axios';

// React Navigation 훅·타입
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에 정의된 RootStackParamList를 import (경로는 실제 경로에 맞게 수정)
import type { RootStackParamList } from '../../navigation/AppNavigator';

// Main 화면에서는 “props 없이” navigation 훅만 씁니다.
type MainNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// 하위 컴포넌트들
import YearMonthSelector from './YearMonthSelector';
import CalendarGrid from './CalendarGrid';
import DiarySection from './DiarySection';
import MenuBar from '../MenuBar/MenuBar';
import MenuIcon from '../MenuBar/MenuIcon';

const emotionImageMap: { [key: string]: any } = {
  중립: require('../../assets/images/neutral.png'),
  놀람: require('../../assets/images/surprise.png'),
  화남: require('../../assets/images/angry.png'),
  행복: require('../../assets/images/happy.png'),
  슬픔: require('../../assets/images/sad.png'),
  혐오: require('../../assets/images/disgust.png'),
  공포: require('../../assets/images/fear.png'),
};

const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainNavProp>();

  // 내부 state로 년/월/선택일 관리
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(5);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 서버에서 받아온 “{ date, emotion }[]”
  const [emotionData, setEmotionData] = useState<{ date: string; emotion: string }[]>([]);
  // API 호출 중 여부
  const [loading, setLoading] = useState<boolean>(false);
  // 메뉴바 열림 여부
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // 월별 감정 데이터를 서버에서 불러오는 함수
  const fetchMonthlyEmotions = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        'http://121.189.72.83:8888/api/emotion/month',
        {
          user_id: 1,
          month,
          year,
        }
      );
      // 성공적으로 내려온 경우에만 상태 업데이트
      if (res.status === 200 && Array.isArray(res.data.emotions)) {
        setEmotionData(res.data.emotions);
      } else {
        // 혹시 빈 배열로 내려왔다면 초기화
        setEmotionData([]);
      }
    } catch (error) {
      console.warn('월별 감정 불러오기 실패:', error);
      // 에러가 나더라도 빈 배열로 초기화해 둡니다.
      setEmotionData([]);
    } finally {
      setLoading(false);
    }
  };

  // year 또는 month가 바뀔 때마다 데이터 재조회
  useEffect(() => {
    fetchMonthlyEmotions();
  }, [month, year]);

  // 다이어리 섹션 헤더(날짜) 클릭 시 호출
  const handleDiaryPress = () => {
    // selectedDate가 없으면 무시
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

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── 메뉴 아이콘 (좌상단) ─── */}
      <MenuIcon onPress={() => setMenuVisible(true)} />

      {/* ─── 메뉴바 (즐겨찾기 선택 시 Favorites로 이동) ─── */}
      <MenuBar
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onFavorites={() => {
          setMenuVisible(false);
          navigation.navigate('Favorites');
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ─── 연/월 선택 컴포넌트 ─── */}
        <YearMonthSelector
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
        />

        {/* ─── 실제 데이터가 내려오기 전이라도 “달력+일기 섹션”은 무조건 렌더링 ─── */}
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

        {/* ─── “업데이트 중”을 알려주는 ActivityIndicator는 달력/섹션 하단에만 간단히 보여줍니다. ─── */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6A0DAD" />
            <Text style={styles.loadingText}>월별 감정을 불러오는 중...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E1FF',
    paddingHorizontal: 16,
    paddingTop: 60, // 메뉴 아이콘 공간 확보
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
