// 파일: App.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './components/Splash/SplashScreen';
import LoginScreen from './components/Login/LoginScreen';

// React Navigation 전체 네비게이터
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  // ───────────────────────────────────────────────────────────
  // 1) Splash / 로그인 상태만 여기서 관리
  // ───────────────────────────────────────────────────────────
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setTimeout(() => {
        setShowSplash(false);
        setLoading(false);
      }, 1500);
    };
    initialize();
  }, []);

  // 1-1) Splash 화면
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  // 1-2) 로그인 화면 (토큰 없으면)
  if (!userToken) {
    return <LoginScreen setUserToken={setUserToken} />;
  }

  // ───────────────────────────────────────────────────────────
  // 2) 로그인 완료 후: 네비게이터 전체를 렌더
  // ───────────────────────────────────────────────────────────
  //    - 이 내부에서 모든 화면 전환(DiaryDetail, EmotionAnalyze, Favorites 등)을
  //      네비게이터가 담당합니다.
  return <AppNavigator />;
}
