/* eslint-disable @typescript-eslint/no-unused-vars */
// 파일: src/components/DiaryAndAnalyze/SignIn.tsx

import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import API from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
    Login: undefined;
    Main: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface SignInProps {
    setUserToken: (token: string) => void;
}

export default function SignIn({ setUserToken }: SignInProps) {
    const navigation = useNavigation<NavigationProp>();

    // ─── 1) 상태 정의 ────────────────────────────────────────────────────
    const [user_type, setUserType] = useState<'user' | 'guardian' | ''>('');
    const [name, setName] = useState(''); // 사용자 이름
    const [username, setUsername] = useState(''); // 아이디
    const [password, setPW] = useState('');
    const [checkPW, setCheckPW] = useState('');
    const [email, setEmail] = useState(''); // 이메일

    // 생년월일 관련 (텍스트 대신 DatePicker 사용)
    const [birthdate, setBirthdate] = useState<string>(''); // "YYYY-MM-DD" 문자열
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date()); // DatePicker용 임시 날짜 객체

    const [gender, setGender] = useState<'male' | 'female' | ''>('');

    // ─── 2) 생년월일 선택기에서 날짜를 고르면 호출되는 핸들러 ────────────────
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // iOS에서는 계속 보여 주도록, Android는 한 번 선택하면 닫힘
        if (selectedDate) {
            // 선택된 Date 객체를 "YYYY-MM-DD" 형식 문자열로 포맷
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;
            setBirthdate(formatted);
            setTempDate(selectedDate);
        }
    };

    // ─── 3) 회원가입 함수 ──────────────────────────────────────────────────
    const Signup = async () => {
        if (password !== checkPW) {
            Alert.alert('비밀번호 불일치', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
        // 필수 입력 검증
        if (
            !name.trim() ||
            !username.trim() ||
            !password.trim() ||
            !email.trim() ||
            !user_type ||
            !birthdate ||
            !gender
        ) {
            Alert.alert('입력 오류', '모든 항목을 빠짐없이 입력해 주세요.');
            return;
        }

        try {
            const body = {
                username: username.trim(),
                password: password,
                name: name.trim(),
                email: email.trim(),
                user_type: user_type,
                birthdate: birthdate, // "YYYY-MM-DD"
                gender: gender,
            };
            const response = await API.post('/api/people/signup', body);
            if (response.data && response.data.message) {
                // 예시: 서버가 access token까지 같이 내려준다고 가정할 경우
                // const receivedToken = response.data.access; 

                Alert.alert('회원가입 성공', response.data.message, [
                    {
                      text: '확인',
                      onPress: () => {
                        navigation.navigate('Login'); // 바로 로그인 화면으로 이동
                      },
                    },
                  ]);
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errors = error.response.data;
                let messages: string[] = [];
                for (const key in errors) {
                    if (Array.isArray(errors[key])) {
                        messages.push(`${key}: ${errors[key].join(', ')}`);
                    } else {
                        messages.push(`${key}: ${errors[key]}`);
                    }
                }
                Alert.alert('회원가입 실패', messages.join('\n'));
            } else {
                Alert.alert('회원가입 실패', '알 수 없는 오류가 발생했습니다.');
            }
            console.error('[Signup error]', error);
        }
    };

    // ─── 4) 아이디 중복 확인 함수 ─────────────────────────────────────────
    const duplicate = async () => {
        if (!username.trim()) {
            Alert.alert('아이디를 입력하세요');
            return;
        }
        try {
            const response = await API.post('/checkID', { id: username.trim() });
            if (response.data.exists) {
                Alert.alert('이미 존재하는 아이디 입니다.');
            } else {
                Alert.alert('사용 가능한 아이디 입니다.');
            }
        } catch (error) {
            Alert.alert('확인 실패', '아이디 중복 확인 중 오류가 발생했습니다.');
            console.error('[duplicate error]', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ─── 5) 폼 전체를 세로 중앙 정렬하도록 감싸는 뷰 ──────────────────────── */}
            <View style={styles.centeredContainer}>
                <Text style={styles.title}>TodAi에 오신 것을 환영합니다!</Text>

                {/* ─── 이름 입력 ───────────────────────────────────────────────────── */}
                <TextInput
                    style={styles.input}
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor="#bea4d2"
                    value={name}
                    onChangeText={setName}
                />

                {/* ─── 아이디 입력 + 중복확인 버튼 ───────────────────────────────────────── */}
                <View style={styles.rowWrapper}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="아이디를 입력하세요"
                        placeholderTextColor="#bea4d2"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TouchableOpacity style={styles.checkID} onPress={duplicate}>
                        <Text style={styles.checkIDtext}>중복확인</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── 비밀번호 입력 ───────────────────────────────────────────────── */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor="#bea4d2"
                    secureTextEntry
                    value={password}
                    onChangeText={setPW}
                />

                {/* ─── 비밀번호 확인 입력 ─────────────────────────────────────────────── */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    placeholderTextColor="#bea4d2"
                    secureTextEntry
                    value={checkPW}
                    onChangeText={setCheckPW}
                />

                {/* ─── 이메일 입력 ─────────────────────────────────────────────────── */}
                <TextInput
                    style={styles.input}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor="#bea4d2"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* ─── 생년월일: TextInput 대신 DatePicker 트리거 ───────────────────────────── */}
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: birthdate ? '#333' : '#bea4d2' }}>
                        {birthdate || '생년월일 (YYYY-MM-DD)'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDate}
                        maximumDate={new Date()} // 오늘 이후 날짜는 고를 수 없게
                    />
                )}

                {/* ─── 사용자 유형 선택 ─────────────────────────────────────────────── */}
                <View style={[styles.buttonRow, { marginTop: 10 }]}>
                    <TouchableOpacity
                        style={[
                            styles.choiceButton,
                            user_type === 'user' && styles.choiceButtonSelected,
                            { marginRight: 10 },
                        ]}
                        onPress={() => setUserType('user')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.choiceButtonText,
                                user_type === 'user' && { fontWeight: 'bold', color: '#fff' },
                            ]}
                        >
                            사용자
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.choiceButton,
                            user_type === 'guardian' && styles.choiceButtonSelected,
                        ]}
                        onPress={() => setUserType('guardian')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.choiceButtonText,
                                user_type === 'guardian' && { fontWeight: 'bold', color: '#fff' },
                            ]}
                        >
                            보호자
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── 성별 선택 ──────────────────────────────────────────────────────── */}
                <View style={[styles.buttonRow, { marginTop: 10 }]}>
                    <TouchableOpacity
                        style={[
                            styles.choiceButton,
                            gender === 'male' && styles.choiceButtonSelected,
                            { marginRight: 10 },
                        ]}
                        onPress={() => setGender('male')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.choiceButtonText,
                                gender === 'male' && { fontWeight: 'bold', color: '#fff' },
                            ]}
                        >
                            남성
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.choiceButton,
                            gender === 'female' && styles.choiceButtonSelected,
                        ]}
                        onPress={() => setGender('female')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.choiceButtonText,
                                gender === 'female' && { fontWeight: 'bold', color: '#fff' },
                            ]}
                        >
                            여성
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── 회원가입 버튼 ─────────────────────────────────────────────────── */}
                <TouchableOpacity style={styles.finishButton} onPress={Signup}>
                    <Text style={styles.finishText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // SafeAreaView를 배경색으로 채우고, 자식 컨테이너는 중앙 정렬
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',   // 세로 중앙 정렬
        paddingHorizontal: 20,       // 좌우 여백
    },
    title: {
        fontSize: 20,
        color: '#531ea3',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    // ─── 공통 입력 필드 ──────────────────────────────────────────────
    input: {
        height: 50,
        backgroundColor: '#f5e0ff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        justifyContent: 'center',
        marginBottom: 12,
        // DatePicker 대체용 TouchableOpacity에서 텍스트 가운데 정렬
    },
    // ─── 아이디 + 중복확인 버튼을 가로로 배치 ─────────────────────────────
    rowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    checkID: {
        width: 100,
        height: 50,
        backgroundColor: '#e8b7ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginLeft: 10,
        marginBottom: 12,
    },
    checkIDtext: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    // ─── 사용자/보호자 및 남성/여성 선택 버튼 행 ─────────────────────────
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
    },
    choiceButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#e8b7ff',
        borderRadius: 25,             // pill 모양
        justifyContent: 'center',
        alignItems: 'center',
    },
    choiceButtonSelected: {
        backgroundColor: '#DB94FD',    // 선택된 상태의 진한 보라색
    },
    choiceButtonText: {
        fontSize: 16,
        color: '#9771b5',
        fontWeight: '400',
    },
    // ─── 최종 회원가입 버튼 ───────────────────────────────────────────
    finishButton: {
        marginTop: 20,
        height: 50,
        backgroundColor: '#C096ED',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    finishText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});