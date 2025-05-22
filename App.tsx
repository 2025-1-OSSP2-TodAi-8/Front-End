/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './components/Splash/SplashScreen';
import LoginScreen from './components/Login/LoginScreen';
import MainScreen from './components/Main/MainScreen';
import DiaryDetailScreen from './components/Diary/DiaryDetailScreen';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [diaryDetail, setDiaryDetail] = useState<{
    date: string;
    emotion: string;
    content: string;
  } | null>(null);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(5);
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      console.log('🔑 Loaded token:', token);
      setUserToken(token);
      setTimeout(() => {
        setShowSplash(false);
        setLoading(false);
      }, 1500);
    };
    initialize();
  }, []);

  if (loading || showSplash) return <SplashScreen />;

  // 👉 1. 로그인 상태 아니면 로그인 화면
  if (!userToken) {
    return <LoginScreen setUserToken={setUserToken} />;
  }

  // 👉 2. 다이어리 상세 보기 상태면 그 화면
  if (diaryDetail) {
    return (
      <DiaryDetailScreen
        date={diaryDetail.date}
        emotion={diaryDetail.emotion}
        content={diaryDetail.content}
        onBack={() => {
          const [y, m, d] = diaryDetail.date.split('-').map(Number);
          setYear(y);
          setMonth(m);
          setSelectedDate(diaryDetail.date);
          setDiaryDetail(null);
        }}
      />
    );
  }

  // 👉 3. 기본은 메인 화면
  return (
    <MainScreen
      setUserToken={setUserToken}
      onDiaryPress={(entry) => setDiaryDetail(entry)}
      year={year}
      month={month}
      selectedDate={selectedDate}
      setYear={setYear}
      setMonth={setMonth}
      setSelectedDate={setSelectedDate}
    />
  );
}
