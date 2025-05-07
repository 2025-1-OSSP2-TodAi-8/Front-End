// components/Main/MainScreen.tsx
import React from 'react';
import { SafeAreaView, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceRecorder from '../VoiceRecorder';

type Props = {
  setUserToken: (token: string | null) => void;
};

const MainScreen = ({ setUserToken }: Props) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null); // 로그인 화면으로 전환
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TodAi</Text>
      <Text style={styles.subtitle}>텍스트를 넘어, 감정을 기록하다.</Text>
      <VoiceRecorder />
      <Button title="로그아웃" onPress={handleLogout} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
    marginTop: 10,
  },
});

export default MainScreen;
