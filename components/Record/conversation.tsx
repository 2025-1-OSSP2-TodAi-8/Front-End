// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Conversation/Conversation.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    Text,
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import AudioRecorder from './VoiceRecorder';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 메뉴 관련 컴포넌트
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';
import WithMenuLayout from '../MenuBar/MenuBarLayout';

const { width, height } = Dimensions.get('window');

const Conversation = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const date = route.params?.date;

    // ─── (1) 기존 스테이트들 ───
    const [showQuestion, setQuestion] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordStart, setrecordStart] = useState(false);
    const [showSummary, setshowSummary] = useState(false);
    const [summarytext, setsummarytext] = useState('');
    const [questionAnimation] = useState(new Animated.Value(0));
    const [userRecordingAnimation] = useState(new Animated.Value(0));
    const [summaryAnimation] = useState(new Animated.Value(0));

    // ─── (2) 메뉴바 열림 여부 ───
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // ─── (3) 로그아웃 콜백 (WithMenuLayout → MenuBar에 전달) ───
    async function setUserToken(token: string | null): Promise<void> {
        console.log('로그아웃, 토큰 →', token);
        if (token === null) {
            // 토큰이 null일 때 (로그아웃 요청 시)
            await AsyncStorage.removeItem('accessToken');
            navigation.replace('LoginScreen'); // 로그인 화면으로 이동
        }
        // 실제 로그아웃 로직이 필요하다면 여기에 작성하세요. (주석은 유지하거나 삭제 가능)
    }

    // ─── 기존 질문 애니메이션 useEffect ───
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuestion(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showQuestion) {
            Animated.timing(questionAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [showQuestion]);

    // ─── 요약 텍스트 fetch 함수 (예시) ───
    const fetchSummary = async () => {
        try {
            const response = await fetch('http://서버주소/summary');
            const result = await response.json();
            setsummarytext(result.summary || 'summary 실패');
        } catch (error) {
            console.error('summary 실패', error);
            setsummarytext('summary 실패');
        }
    };

    // ─── 녹음 토글 로직 ───
    const toggleRecording = () => {
        setIsRecording(prev => {
            const newState = !prev;
            if (newState) {
                // 녹음 시작
                setrecordStart(true);
                userRecordingAnimation.setValue(0);
                Animated.timing(userRecordingAnimation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                // 녹음 종료 후 요약 보여주기
                setTimeout(() => {
                    setshowSummary(true);
                    summaryAnimation.setValue(0);
                    Animated.timing(summaryAnimation, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                    fetchSummary();
                }, 500);
            }
            return newState;
        });
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
            <WithMenuLayout setUserToken={setUserToken}>
                <SafeAreaView style={styles.container}>

                    {/* ─── ① 메뉴 아이콘 (절대위치로 화면 좌상단에 고정) ─── */}
                    {!menuVisible && (
                        <MenuIcon
                            isOpen={false}
                            onPress={() => setMenuVisible(true)}
                        // containerStyle을 주지 않아도, MenuIcon 내부에 이미 top:70,left:25가 있기 때문에
                        // 부모인 SafeAreaView를 기준으로 "노치 바로 아래 좌측"에 자동으로 붙습니다.
                        />
                    )}

                    {/* ─── ② TodAi 텍스트 — 헤더 내에서만 가로 중앙 정렬 ─── */}
                    <View style={styles.header}>
                        <Text style={styles.title}>TodAi</Text>
                    </View>

                    {/* ─── ③ 메뉴가 열렸다면 MenuBar 렌더링 ─── */}
                    {menuVisible && (
                        <MenuBar
                            visible={menuVisible}
                            onClose={() => setMenuVisible(false)}
                            onFavorites={() => {
                                setMenuVisible(false);
                                navigation.navigate('Favorites');
                            }}
                            setUserToken={setUserToken}
                            isOpen={menuVisible}      // 메뉴바 안쪽 햄버거 90° 회전
                            toggleMenu={() => setMenuVisible(false)}
                        />
                    )}

                    {/* ─── TodAi 바로 아래 구분선 ─── */}
                    <View style={styles.divider1} />

                    {/* ─── 질문 텍스트 영역 ─── */}
                    <View style={styles.middle}>
                        {date && (
                            <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                                <Text style={styles.dateText}>
                                    {`${date.slice(0, 4)}년 ${parseInt(date.slice(5, 7), 10)}월 ${parseInt(date.slice(8, 10), 10)}일`}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.subtitle}>오늘 하루를 기록해 주세요</Text>
                        {showQuestion && (
                            <Animated.View style={[styles.question, { opacity: questionAnimation }]}>
                                <Text style={styles.text}>오늘 하루는 어떠셨나요?</Text>
                            </Animated.View>
                        )}
                    </View>

                    {/* ─── 마이크 버튼 및 버튼 바로 위 구분선 ─── */}
                    <View style={styles.micContainer}>
                        <View style={styles.divider2} />
                        <TouchableOpacity onPress={toggleRecording} style={styles.micButton}>
                            <Image
                                source={require('../../assets/images/mic.png')}
                                style={styles.mic}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ─── 오디오 녹음 & 요약 애니메이션 ─── */}
                    <AudioRecorder start={isRecording} onFinish={() => setIsRecording(false)} />

                    {recordStart && (
                        <Animated.View style={[styles.userRecording, { opacity: userRecordingAnimation }]}>
                            <Image
                                source={require('../../assets/images/longwave.png')}
                                style={styles.userRecordingImage}
                            />
                        </Animated.View>
                    )}

                    {showSummary && (
                        <Animated.View style={[styles.summary, { opacity: summaryAnimation }]}>
                            <Text style={styles.summarytext}>
                                {summarytext || '@님의 오늘의 이야기를 더 들을 수 있을까요?'}
                            </Text>
                        </Animated.View>
                    )}
                </SafeAreaView>
            </WithMenuLayout>
        </View >
    );
};

const styles = StyleSheet.create({
    // ────────────────────────────────────────────────────────────
    // (1) container에서 더 이상 alignItems:'center'를 하지 않습니다.
    //     SafeAreaView 기준으로 MenuIcon의 top/left가 올바르게 먹히게 하기 위함.
    // ────────────────────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#f5e0ff',
    },

    // ────────────────────────────────────────────────────────────
    // (2) header: TodAi 텍스트만 가로 중앙으로 정렬
    // ────────────────────────────────────────────────────────────
    header: {
        width: '100%',
        justifyContent: 'center',  // 오직 텍스트만 가운데
        alignItems: 'center',
        paddingTop: 70,            // 노치/상태바 아래
        paddingBottom: 5,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#531ea3',
    },

    // ────────────────────────────────────────────────────────────
    // TodAi 바로 아래 구분선
    // ────────────────────────────────────────────────────────────
    divider1: {
        width: '100%',
        height: 2,
        backgroundColor: '#531ea3',
        marginBottom: 12,
        borderRadius: 1,
        alignSelf: 'center',
    },

    // ────────────────────────────────────────────────────────────
    // 질문 텍스트 영역
    // ────────────────────────────────────────────────────────────
    subtitle: {
        position: 'absolute',
        fontSize: 12,
        color: '#888',
        top: 25,
        alignSelf: 'center',      // '오늘 하루를 기록해 주세요' 텍스트 가로 중앙
    },
    question: {
        position: 'absolute',
        width: 200,
        height: 40,
        top: 55,
        left: 15,
        backgroundColor: '#ded1ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 7,
    },
    text: {
        fontSize: 14,
        color: '#000',
    },
    middle: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    // ────────────────────────────────────────────────────────────
    // 마이크 버튼 및 버튼 바로 위 구분선
    // ────────────────────────────────────────────────────────────
    micContainer: {
        position: 'absolute',
        bottom: 15,
        width: '100%',
        alignItems: 'center',    // 마이크 버튼만 가로 중앙
    },
    divider2: {
        width: '100%',
        height: 2,
        backgroundColor: '#531ea3',
        marginBottom: 12,
        borderRadius: 1,
        alignSelf: 'center',
    },
    micButton: {
        width: 50,
        height: 50,
    },
    mic: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },

    // ────────────────────────────────────────────────────────────
    // 오디오 녹음 애니메이션
    // ────────────────────────────────────────────────────────────
    userRecording: {
        position: 'absolute',
        width: 200,
        height: 40,
        backgroundColor: '#fff',
        top: 255,
        right: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 7,
    },
    userRecordingImage: {
        width: 150,
        height: 100,
        resizeMode: 'contain',
    },

    // ────────────────────────────────────────────────────────────
    // 요약 애니메이션
    // ────────────────────────────────────────────────────────────
    summary: {
        position: 'absolute',
        width: 200,
        height: 100,
        top: 330,
        left: 15,
        backgroundColor: '#ded1ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 7,
    },
    summarytext: {
        fontSize: 13,
        color: '#000',
    },

    dateText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 8,
    },
});

export default Conversation;
