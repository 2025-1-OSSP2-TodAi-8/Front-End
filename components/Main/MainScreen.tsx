/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

import YearMonthSelector from './YearMonthSelector';
import CalendarGrid from './CalendarGrid';
import DiarySection from './DiarySection';

const emotionImageMap: { [key: string]: any } = {
  중립: require('../../assets/images/neutral.png'),
  놀람: require('../../assets/images/surprise.png'),
  화남: require('../../assets/images/angry.png'),
  행복: require('../../assets/images/happy.png'),
  슬픔: require('../../assets/images/sad.png'),
  혐오: require('../../assets/images/disgust.png'),
  공포: require('../../assets/images/fear2.png'),
};

type MainScreenProps = {
  setUserToken: (token: string | null) => void;
  onDiaryPress: (entry: { date: string; emotion: string; content: string }) => void;
  year: number;
  month: number;
  selectedDate: string | null;
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
  setSelectedDate: (d: string | null) => void;
  setYearMonthAndDateRef?: (setter: (year: number, month: number, date: string) => void) => void;
};

const MainScreen = ({ setUserToken, onDiaryPress, year, month, selectedDate, setYear, setMonth, setSelectedDate, setYearMonthAndDateRef }: MainScreenProps) => {
  const [emotionData, setEmotionData] = React.useState<{ date: string; emotion: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  // 외부에서 연/월/일을 세팅할 수 있도록 콜백 등록
  React.useEffect(() => {
    if (setYearMonthAndDateRef) {
      setYearMonthAndDateRef((y, m, d) => {
        setYear(y);
        setMonth(m);
        setSelectedDate(d);
      });
    }
  }, [setYearMonthAndDateRef]);

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
              emotionImageMap={emotionImageMap}
            />
            <DiarySection
              selectedDate={selectedDate}
              emotionData={emotionData}
              emotionImageMap={emotionImageMap}
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
