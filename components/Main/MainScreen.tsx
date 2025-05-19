/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

import YearMonthSelector from './YearMonthSelector';
import CalendarGrid from './CalendarGrid';
import DiarySection from './DiarySection';

const emotionEmojiMap: { [key: string]: string } = {
  중립: '😐',
  놀람: '😲',
  화남: '😠',
  행복: '😊',
  슬픔: '😢',
  혐오: '🤢',
  공포: '😱',
};

type MainScreenProps = {
  setUserToken: (token: string | null) => void;
  onDiaryPress: (entry: { date: string; emotion: string; content: string }) => void;
};

const MainScreen = ({ setUserToken, onDiaryPress }: MainScreenProps) => {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [emotionData, setEmotionData] = useState<{ date: string; emotion: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyEmotions = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://4c309c98-3beb-4459-a9b0-04c1e3cbf046.mock.pstmn.io/api/emotions', {
        user_id: 1,
        month,
        year,
      });

      setEmotionData(res.data.emotions);
    } catch (error) {
      console.error('📛 월별 감정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyEmotions();
  }, [month, year]);

  const handleDiaryPress = () => {
    const emotion = emotionData.find((item) => item.date === selectedDate)?.emotion ?? '';
    onDiaryPress({
      date: selectedDate ?? '',
      emotion,
      content: '', // 추후 서버 연동 시 데이터 받아오면 여기에 추가
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <YearMonthSelector year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
        {loading ? (
          <ActivityIndicator size="large" color="#999" />
        ) : (
          <>
            <CalendarGrid
              year={year}
              month={month}
              emotionData={emotionData}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              emotionEmojiMap={emotionEmojiMap}
            />
            <DiarySection
              selectedDate={selectedDate}
              emotionData={emotionData}
              emotionEmojiMap={emotionEmojiMap}
              onPressHeader={handleDiaryPress}
            />
          </>
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
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default MainScreen;
