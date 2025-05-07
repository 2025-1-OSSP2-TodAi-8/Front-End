// components/Login/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  setUserToken: (token: string) => void;
};

const LoginScreen = ({ setUserToken }: Props) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (id === 'test' && password === '1234') {
      await AsyncStorage.setItem('userToken', 'dummy-token');
      setUserToken('dummy-token'); // 화면 전환
    } else {
      Alert.alert('로그인 실패', '아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <View>
      <Text>아이디</Text>
      <TextInput value={id} onChangeText={setId} />
      <Text>비밀번호</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="로그인" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
