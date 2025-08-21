// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Login/Login.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api/axios';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginProps {
  setUserToken: (token: string) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}

export default function Login({ setUserToken, setUserType }: LoginProps) {
  const navigation = useNavigation<NavigationProp>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 시연용 계정
    if (userId === 'test1' && password === '1234') {
      await AsyncStorage.setItem('accessToken', 'dummy_access_token');
      await AsyncStorage.setItem('refreshToken', 'dummy_refresh_token');
      await AsyncStorage.setItem('guardianId', '');
      await AsyncStorage.setItem('userGender', 'FEMALE');
      setUserToken('dummy_access_token');
      setUserType('user');
      navigation.navigate('Main');
      return;
    }
  
    if (userId === 'guardian' && password === '1234') {
      await AsyncStorage.setItem('accessToken', 'dummy_access_token');
      await AsyncStorage.setItem('refreshToken', 'dummy_refresh_token');
      await AsyncStorage.setItem('guardianId', userId);
      setUserToken('dummy_access_token');
      setUserType('guardian');
      navigation.navigate('GuardianFirst');
      return;
    }
  
    // 실제 로그인 API 요청
    try {
      const response = await API.post('/api/people/signin', {
        username: userId,
        password: password,
      });
  
      console.log('✅ 로그인 응답:', response.data);
  
      const { success, data, error } = response.data;
  
      if (success && data) {
        const {
          accessToken,
          refreshToken,
          userType,
          gender, 
        }: {
          accessToken: string;
          refreshToken: string;
          userType: 'user' | 'guardian' | string;
          gender: 'MALE' | 'FEMALE';
        } = data;
  
        // 필수 데이터 유효성 확인
        if (!accessToken || !refreshToken || !userType || !gender) {
          Alert.alert('로그인 실패', '응답 데이터가 올바르지 않습니다.');
          return;
        }
  
        // 로그인 성공 처리
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userGender', gender);
        setUserToken(accessToken);
        setUserType(userType.toLowerCase() as 'user' | 'guardian');
  
        if (userType.toLowerCase() === 'user') {
          await AsyncStorage.setItem('guardianId', '');
          navigation.navigate('Main');
        } else if (userType.toLowerCase() === 'guardian') {
          await AsyncStorage.setItem('guardianId', userId);
          navigation.navigate('GuardianFirst');
        } else {
          await AsyncStorage.setItem('guardianId', '');
          navigation.navigate('Main');
        }
  
      } else {
        // 로그인 실패 처리
        const errorMessage = error?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다.';
        Alert.alert('로그인 실패', errorMessage);
      }
  
    } catch (error: any) {
      console.error('[Login] 서버 요청 에러:', error);
      Alert.alert('오류 발생', '서버에 연결할 수 없습니다.');
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>로그인</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="아이디를 입력하세요"
          placeholderTextColor="#BCA4D2"
          value={userId}
          autoCapitalize="none"
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#BCA4D2"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>기존 회원이 아니신가요?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.6}>
          <Text style={styles.signUpText}>회원가입 하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  headerContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.15,
  },
  title: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.33,
    left: SCREEN_WIDTH * 0.02,
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '600',
    color: '#333333',
  },
  formContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.35,
    width: '100%',
  },
  input: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.065,
    backgroundColor: '#f5e0ff',
    borderRadius: 12,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.02,
    color: '#555555',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  loginButton: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.07,
    backgroundColor: '#e8b7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },
  footerText: {
    color: '#888888',
    fontSize: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  signUpText: {
    color: '#888888',
    fontSize: SCREEN_WIDTH * 0.035,
    textDecorationLine: 'underline',
  },
});
