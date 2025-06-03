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

type RootStackParamList = {
    LoginScreen: undefined;
    SignIn: undefined;
    Main: undefined;             // 일반 사용자 메인 화면
    GuardianSearch: undefined;   // 보호자 전용 검색 화면
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface LoginProps {
    setUserToken: (token: string) => void;

}

export default function Login({ setUserToken }: LoginProps) {
    const navigation = useNavigation<NavigationProp>();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // 임시 테스트 계정
        if (userId === 'test' && password === '1234') {
            await AsyncStorage.setItem('accessToken', 'dummy_access_token');
            await AsyncStorage.setItem('refreshToken', 'dummy_refresh_token');
            setUserToken('dummy_access_token');
            navigation.navigate('Main');
            return;
        }

        try {
            // ─── POST /api/people/signin ───
            const response = await API.post('/api/people/signin', {
                username: userId,
                password: password,
            });

            // 응답 예: { refresh: "eyJhbGc...", access: "eyJhbGci..." }
            if (response.status === 200 && response.data) {
                const { access, refresh, user_type } = response.data as {
                    access: string;
                    refresh: string;
                    user_type: 'user' | 'guardian';
                };

                // 1) AsyncStorage에 두 토큰 모두 저장
                await AsyncStorage.setItem('accessToken', access);
                await AsyncStorage.setItem('refreshToken', refresh);

                // 2) 부모 컴포넌트에 access 토큰값 전달
                setUserToken(access);

                // 3) user_type에 따라 화면 분기
                if (user_type === 'user') {
                    // 일반 사용자 → Main 화면으로 이동
                    navigation.navigate('Main');
                } else if (user_type === 'guardian') {
                    // eslint-disable-next-line quotes
                    console.log("가디언 도착함");
                    // 보호자 → GuardianSearch 화면으로 이동
                    navigation.navigate('GuardianSearch');
                } else {
                    // 혹시 예외적인 값이 오면 기본은 Main으로
                    navigation.navigate('Main');
                    // eslint-disable-next-line quotes
                    console.log("예외 적인 값 도착함");
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

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.loginButtonText}>로그인</Text>
                </TouchableOpacity>
            </View>

            {/* ─── 하단: 회원가입 링크 ─── */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>기존 회원이 아니신가요?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    activeOpacity={0.6}
                >
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
        // 기본 position: 'relative' 상태
    },
    title: {
        position: 'absolute',                // 절대 위치로 조정
        top: SCREEN_HEIGHT * 0.33,           // 상단에서 33% 위치(원하는 만큼 조정)
        left: SCREEN_WIDTH * 0.02,           // 좌측 2% 떨어진 위치
        fontSize: SCREEN_WIDTH * 0.06,       // 글씨 크기: 화면 너비의 6%
        fontWeight: '600',
        color: '#333333',
    },

    // ─── 중간 폼 영역 ───
    formContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: SCREEN_HEIGHT * 0.35,        // 화면 높이의 35% 만큼 높이
        width: '100%',
    },
    input: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.065,       // 높이: 화면 높이의 6.5%
        backgroundColor: '#f5e0ff',
        borderRadius: 12,
        paddingHorizontal: SCREEN_WIDTH * 0.04, // 좌우 여백: 화면 너비의 4%
        marginBottom: SCREEN_HEIGHT * 0.02,     // 입력칸 간격: 화면 높이의 2%
        color: '#555555',
        fontSize: SCREEN_WIDTH * 0.04,          // 글씨 크기: 화면 너비의 4%
    },
    loginButton: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.07,        // 버튼 높이: 화면 높이의 7%
        backgroundColor: '#e8b7ff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SCREEN_HEIGHT * 0.02,     // 버튼 위 여백: 화면 높이의 2%
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: SCREEN_WIDTH * 0.045,      // 글씨 크기: 화면 너비의 4.5%
        fontWeight: '500',
    },

    // ─── 하단 Footer 영역 ───
    footerContainer: {
        alignItems: 'center',
        paddingBottom: SCREEN_HEIGHT * 0.03, // 하단 여백: 화면 높이의 3%
    },
    footerText: {
        color: '#888888',
        fontSize: SCREEN_WIDTH * 0.035,      // 글씨 크기: 화면 너비의 3.5%
        marginBottom: SCREEN_HEIGHT * 0.008, // 아래 여백: 화면 높이의 0.8%
    },
    signUpText: {
        color: '#888888',
        fontSize: SCREEN_WIDTH * 0.035,
        textDecorationLine: 'underline',
    },
}
// eslint-disable-next-line eol-last
);