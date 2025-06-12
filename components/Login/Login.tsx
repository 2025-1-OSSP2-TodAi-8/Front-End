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

// AppNavigator.tsx에서 정의한 RootStackParamList와 일치시킵니다.
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginProps {
  setUserToken: (token: string) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void; // ★ 수정됨: userType 상태를 상위로 전달하기 위해 prop 추가
}

export default function Login({ setUserToken, setUserType }: LoginProps) {
  const navigation = useNavigation<NavigationProp>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // ─── 테스트 계정 분기 ───
    // 1) 일반 사용자 테스트 계정 (Main 화면으로 자동 전환)
    if (userId === 'test' && password === '1234') {
      await AsyncStorage.setItem('accessToken', 'dummy_access_token');
      await AsyncStorage.setItem('refreshToken', 'dummy_refresh_token');
      setUserToken('dummy_access_token');
      setUserType('user'); // 일반 사용자
      await AsyncStorage.setItem('guardianId', '');
      navigation.navigate('Main');
      return;
    }

    // 2) 보호자 테스트 계정 (Search 화면으로 자동 전환)
    if (userId === 'guardian' && password === '1234') {
      await AsyncStorage.setItem('accessToken', 'dummy_access_token');
      await AsyncStorage.setItem('refreshToken', 'dummy_refresh_token');
      setUserToken('dummy_access_token');
      setUserType('guardian'); // 보호자 역할
      await AsyncStorage.setItem('guardianId', userId);
      navigation.navigate('GuardianFirst');
      return;

      // ★ 수정됨: 백엔드가 아닌 사용자가 입력한 userId를 guardianId로 그대로 저장

    }
    // ────────────────────────────────

    // 실제 백엔드 연동 로직 (서버가 준비되면 이 아래 코드가 실행됩니다)
    try {
      // ─── POST /api/people/signin ───
      const response = await API.post('/api/people/signin', {
        username: userId,
        password: password,
      });

      // 응답 예: { refresh: "eyJhbGc...", access: "eyJhbGci...", user_type: "user" | "guardian" }
      if (response.status === 200 && response.data) {
        const { access, refresh, user_type } = response.data as {
          access: string;
          refresh: string;
          user_type: 'user' | 'guardian';
        };

        // 1) AsyncStorage에 두 토큰 저장
        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('refreshToken', refresh);

        // 2) 상위 컴포넌트로 userType, 토큰 전달
        setUserToken(access);
        setUserType(user_type); // ★ 수정됨: 백엔드가 내려준 user_type을 전달

        // 3) 로그인 종류에 따라 분기
        if (user_type === 'user') {
          // 일반 사용자 → guardianId는 빈 문자열로 저장
          await AsyncStorage.setItem('guardianId', ''); // ★ 수정됨
          navigation.navigate('Main');
        } else if (user_type === 'guardian') {
          // 보호자 → 사용자가 입력한 userId를 guardianId로 저장
          await AsyncStorage.setItem('guardianId', userId); // ★ 수정됨
          navigation.navigate('GuardianFirst');
        } else {
          // 예외적인 경우
          await AsyncStorage.setItem('guardianId', ''); // 안전 차원에서 초기화
          navigation.navigate('Main');
        }
      } else {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('[Login] 서버 요청 에러:', error);
      Alert.alert('오류 발생', '서버에 연결할 수 없습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── 상단: 타이틀 영역 ─── */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>로그인</Text>
      </View>

      {/* ─── 중간: 입력 폼 ─── */}
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

      {/* ─── 하단: 회원가입 링크 ─── */}
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
  // SafeAreaView 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 좌우 5% 마진
  },

  // ─── 상단 Title 영역 ───
  headerContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.15, // 화면 높이의 15% 만큼 공간 확보
  },
  title: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.33,
    left: SCREEN_WIDTH * 0.02,
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '600',
    color: '#333333',
  },

  // ─── 중간 폼 영역 ───
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

  // ─── 하단 Footer 영역 ───
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
