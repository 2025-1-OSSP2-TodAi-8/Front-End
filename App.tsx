// ───────────────────────────────────────────────────────────────────────
// 파일: App.tsx
// ───────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api/axios';

import SplashScreen from './components/Splash/SplashScreen';
import LoginScreen from './components/Login/LoginScreen';

// React Navigation 전체 네비게이터
import { LinkProvider } from './components/Gaurdian/LinkContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  // ───────────────────────────────────────────────────────────
  // 1) Splash / 로그인 상태만 여기서 관리
  // ───────────────────────────────────────────────────────────
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'user' | 'guardian' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateToken = async (token: string) => {
      try {
        // 서버에 토큰 유효성 검증 요청 (GET /api/people/)
        const response = await API.get('/api/people/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.status === 200;
      } catch (error) {
        console.error('Token validation failed:', error);
        return false;
      }
    };

    const initialize = async () => {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('guardianId');
      console.log('✅ 초기화 완료 (accessToken, refreshToken, guardianId 제거됨)');
      const token = await AsyncStorage.getItem('accessToken');

      if (token) {
        // 토큰이 있으면 서버에서 유효성 검증
        const isValid = await validateToken(token);
        if (isValid) {
          // (참고) 실제로는 백엔드에서 user_type도 같이 가져와야 하지만,
          // 여기서는 단순히 'user'로 가정하거나, 별도 API 호출을 통해 userType을 받아야 합니다.
          // 예시: const { user_type } = await API.get('/api/people/me', {...});
          setUserToken(token);
          // 임시로 userType을 'user'로 세팅 (실제 로직에서는 API 결과에 따라 세팅)
          setUserType('guardian');
          setLoading(false);
        } else {
          // 토큰이 유효하지 않으면 삭제하고 로그인 화면으로
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          setUserToken(null);
          setUserType(null);
          setTimeout(() => setLoading(false), 1500);
        }
      } else {
        // 토큰이 없으면 스플래시 화면 표시 후 로그인 화면으로
        setTimeout(() => setLoading(false), 1500);
      }
    };
    initialize();
  }, []);

  // Show splash screen only when loading and no token
  if (loading && !userToken) {
    return <SplashScreen />;
  }

  // 네비게이터에 userToken, userType, setter들을 prop으로 넘김
    return (
        <LinkProvider>
          <AppNavigator
            userToken={userToken}
            userType={userType}
            setUserToken={setUserToken}
            setUserType={setUserType}
          />
       </LinkProvider>
);

}