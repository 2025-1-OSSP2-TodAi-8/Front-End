// 파일: App.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api/axios';

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
    const validateToken = async (token: string) => {
      try {
        // 서버에 토큰 유효성 검증 요청 (GET /api/people/)
        const response = await API.get('/api/people/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.status === 200;
      } catch (error) {
        console.error('Token validation failed:', error);
        return false;
      }
    };

    const initialize = async () => {
      const token = await AsyncStorage.getItem('accessToken');

      if (token) {
        // 토큰이 있으면 서버에서 유효성 검증
        const isValid = await validateToken(token);
        if (isValid) {
          setUserToken(token);
          setLoading(false);
        } else {
          // 토큰이 유효하지 않으면 삭제하고 로그인 화면으로
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          setUserToken(null);
          setTimeout(() => setLoading(false), 1500);
        }
      } else {
        // 토큰이 없으면 스플래시 화면 표시
        setTimeout(() => setLoading(false), 1500);
      }
    };
    initialize();
  }, []);

  // Show splash screen only when loading and no token
  if (loading && !userToken) {
    return <SplashScreen />;
  }

  // 네비게이터에 userToken, setUserToken을 prop으로 넘김
  return <AppNavigator userToken={userToken} setUserToken={setUserToken} />;
}
