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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import API from '../../api/axios';

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

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [checkPW, setCheckPW] = useState('');
    const [email, setEmail] = useState('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [userType, setUserType] = useState<'USER' | 'GUARDIAN' | ''>('');
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;
            setBirthdate(formatted);
            setTempDate(selectedDate);
        }
    };

    const Signup = async () => {
        if (password !== checkPW) {
            Alert.alert('비밀번호 불일치', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        if (!name || !username || !password || !email || !birthdate || !userType || !gender) {
            Alert.alert('입력 오류', '모든 항목을 빠짐없이 입력해 주세요.');
            return;
        }

        try {
            const body = {
                username,
                password,
                name,
                userType,
                birthdate,
                gender,
                email,
            };

            const response = await API.post('/api/people/signup', body);

            if (response.data.success) {
                Alert.alert('회원가입 성공', response.data.data || '', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]);
            }
        } catch (error: any) {
            const err = error.response?.data?.error;
            if (err && err.message) {
                Alert.alert('회원가입 실패', err.message);
            } else {
                Alert.alert('회원가입 실패', '알 수 없는 오류가 발생했습니다.');
            }
            console.error('[Signup error]', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.centeredContainer}>
                <Text style={styles.title}>TodAi에 오신 것을 환영합니다!</Text>

                <TextInput style={styles.input} placeholder="닉네임을 입력하세요" placeholderTextColor="#bea4d2" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="아이디를 입력하세요" placeholderTextColor="#bea4d2" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="비밀번호를 입력하세요" placeholderTextColor="#bea4d2" secureTextEntry value={password} onChangeText={setPassword} />
                <TextInput style={styles.input} placeholder="비밀번호 확인" placeholderTextColor="#bea4d2" secureTextEntry value={checkPW} onChangeText={setCheckPW} />
                <TextInput style={styles.input} placeholder="이메일을 입력하세요" placeholderTextColor="#bea4d2" keyboardType="email-address" value={email} onChangeText={setEmail} />

                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
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
                        maximumDate={new Date()}
                    />
                )}

                {/* userType 선택 */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.choiceButton, userType === 'USER' && styles.choiceButtonSelected]}
                        onPress={() => setUserType('USER')}
                    >
                        <Text style={[styles.choiceButtonText, userType === 'USER' && styles.choiceButtonTextSelected]}>
                            사용자
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.choiceButton, userType === 'GUARDIAN' && styles.choiceButtonSelected]}
                        onPress={() => setUserType('GUARDIAN')}
                    >
                        <Text style={[styles.choiceButtonText, userType === 'GUARDIAN' && styles.choiceButtonTextSelected]}>
                            보호자
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* gender 선택 */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.choiceButton, gender === 'MALE' && styles.choiceButtonSelected]}
                        onPress={() => setGender('MALE')}
                    >
                        <Text style={[styles.choiceButtonText, gender === 'MALE' && styles.choiceButtonTextSelected]}>
                            남성
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.choiceButton, gender === 'FEMALE' && styles.choiceButtonSelected]}
                        onPress={() => setGender('FEMALE')}
                    >
                        <Text style={[styles.choiceButtonText, gender === 'FEMALE' && styles.choiceButtonTextSelected]}>
                            여성
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.finishButton} onPress={Signup}>
                    <Text style={styles.finishText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        color: '#531ea3',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 50,
        backgroundColor: '#f5e0ff',
        borderRadius: 12,
        paddingHorizontal: 15,
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        gap: 10,
    },
    choiceButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#e8b7ff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    choiceButtonSelected: {
        backgroundColor: '#DB94FD',
    },
    choiceButtonText: {
        fontSize: 16,
        color: '#9771b5',
    },
    choiceButtonTextSelected: {
        fontWeight: 'bold',
        color: '#fff',
    },
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

