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

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      if (token) {
        setTimeout(() => setLoading(false), 1500);
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // 로그인된 상태: Splash → AppNavigator
  if (userToken && loading) {
    return <SplashScreen />;
  }

  // 네비게이터에 userToken, setUserToken을 prop으로 넘김
  return <AppNavigator userToken={userToken} setUserToken={setUserToken} />;
}
