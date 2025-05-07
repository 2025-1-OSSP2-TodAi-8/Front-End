// App.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './components/Login/LoginScreen';
import MainScreen from './components/Main/MainScreen';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      console.log('🔑 Loaded token:', token); // 콘솔에도 출력
      setUserToken(token);
      setLoading(false);
    };
    loadToken();
  }, []);

  if (loading) return null;

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>


      {/* 화면 조건 분기 */}
      {userToken ? (
        <MainScreen setUserToken={setUserToken} />
      ) : (
        <LoginScreen setUserToken={setUserToken} />
      )}
    </View>
  );
}
