/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// 파일: src/components/Conversation/Conversation.tsx

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
  Alert,
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
  // navigation & route
  const route = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dateParam = route.params?.date; // "YYYY-MM-DD" 형식

  // ─── (1) 기존 스테이트들 ───
  const [showQuestion, setQuestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStart, setRecordStart] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // ─── (2) 새로 추가: 서버에서 받은 요약 텍스트, 감정 배열 상태 ───
  const [summaryText, setSummaryText] = useState<string>('');
  const [emotionArray, setEmotionArray] = useState<number[]>([]);

  const [questionAnimation] = useState(new Animated.Value(0));
  const [userRecordingAnimation] = useState(new Animated.Value(0));
  const [summaryAnimation] = useState(new Animated.Value(0));

  // ─── (3) 메뉴바 열림 여부 ───
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // ─── (4) 로그아웃 콜백 ───
  async function setUserToken(token: string | null): Promise<void> {
    console.log('로그아웃, 토큰 →', token);
    if (token === null) {
      await AsyncStorage.removeItem('accessToken');
      navigation.replace('LoginScreen');
    }
  }

  // ─── (5) 질문 애니메이션 ───
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

  // ─── (6) 녹음 토글 로직 ───
  const toggleRecording = () => {
    setIsRecording(prev => {
      const newState = !prev;
      if (newState) {
        // 녹음 시작
        setRecordStart(true);
        userRecordingAnimation.setValue(0);
        Animated.timing(userRecordingAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // 녹음 종료 후, 잠시 뒤 요약/감정 표시
        setTimeout(() => {
          setShowSummary(true);
          summaryAnimation.setValue(0);
          Animated.timing(summaryAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 500);
      }
      return newState;
    });
  };

  /**
   * AudioRecorder 컴포넌트가 업로드를 마치고 서버 응답을 주면 호출됩니다.
   * result: { success, emotion, text, message? }
   */
  const handleServerResult = (result: {
    success: number;
    emotion: number[];
    text: string;
    message?: string;
  }) => {
    if (result.success === 1) {
      setSummaryText(result.text || '');
      setEmotionArray(result.emotion || []);
    } else {
      Alert.alert('오류', result.message || '서버에서 요약/감정 결과를 받을 수 없습니다.');
      setSummaryText('죄송합니다. 요약 정보를 가져오지 못했습니다.');
      setEmotionArray([]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
      <WithMenuLayout setUserToken={setUserToken}>
        <SafeAreaView style={styles.container}>
          {/* ─── ① 메뉴 아이콘 ─── */}
          {!menuVisible && (
            <MenuIcon
              isOpen={false}
              onPress={() => setMenuVisible(true)}
            />
          )}

          {/* ─── ② 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>TodAi</Text>
          </View>

          {/* ─── ③ 메뉴바 */}
          {menuVisible && (
            <MenuBar
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              onFavorites={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
              }}
              setUserToken={setUserToken}
              isOpen={menuVisible}
              toggleMenu={() => setMenuVisible(false)}
            />
          )}

          {/* ─── ④ 구분선 */}
          <View style={styles.divider1} />

          {/* ─── ⑤ 질문 텍스트 영역 ─── */}
          <View style={styles.middle}>
            {dateParam && (
              <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Text style={styles.dateText}>
                  {`${dateParam.slice(0, 4)}년 ${parseInt(
                    dateParam.slice(5, 7),
                    10,
                  )}월 ${parseInt(dateParam.slice(8, 10), 10)}일`}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.subtitle}>오늘 하루를 기록해 주세요</Text>
            {showQuestion && (
              <Animated.View
                style={[styles.question, { opacity: questionAnimation }]}
              >
                <Text style={styles.text}>오늘 하루는 어떠셨나요?</Text>
              </Animated.View>
            )}
          </View>

          {/* ─── ⑥ 마이크 버튼 ─── */}
          <View style={styles.micContainer}>
            <View style={styles.divider2} />
            <TouchableOpacity onPress={toggleRecording} style={styles.micButton}>
              <Image
                source={require('../../assets/images/mic.png')}
                style={styles.mic}
              />
            </TouchableOpacity>
          </View>

          {/* ─── ⑦ AudioRecorder로 녹음 및 업로드 ─── */}
          <AudioRecorder start={isRecording} onResult={handleServerResult} />

          {/* ─── ⑧ 녹음 애니메이션 (웨이브 이미지) ─── */}
          {recordStart && (
            <Animated.View
              style={[styles.userRecording, { opacity: userRecordingAnimation }]}
            >
              <Image
                source={require('../../assets/images/longwave.png')}
                style={styles.userRecordingImage}
              />
            </Animated.View>
          )}

          {/* ─── ⑨ 요약 & 감정 결과 표시 ─── */}
          {showSummary && (
            <Animated.View style={[styles.summaryContainer, { opacity: summaryAnimation }]}>
              <Text style={styles.summaryTitle}>오늘의 Emotion:</Text>
              <Text style={styles.emotionText}>
                {emotionArray.length
                  ? emotionArray
                      .map((val, idx) => {
                        const labels = [
                          '중립',
                          '놀람',
                          '화남',
                          '행복',
                          '슬픔',
                          '혐오',
                          '공포',
                        ];
                        return `${labels[idx]}:${val}`;
                      })
                      .join('  ')
                  : '감정 정보를 불러올 수 없습니다.'}
              </Text>

              <Text style={styles.summaryTitle}>요약:</Text>
              <Text style={styles.summaryText}>
                {summaryText || '@님의 오늘 이야기를 불러올 수 없습니다.'}
              </Text>
            </Animated.View>
          )}
        </SafeAreaView>
      </WithMenuLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#531ea3',
  },
  divider1: {
    width: '100%',
    height: 2,
    backgroundColor: '#531ea3',
    marginBottom: 12,
    borderRadius: 1,
    alignSelf: 'center',
  },
  subtitle: {
    position: 'absolute',
    fontSize: 12,
    color: '#888',
    top: 25,
    alignSelf: 'center',
  },
  question: {
    position: 'absolute',
    width: 200,
    height: 40,
    top: 55,
    left: 20,
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
  dateText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 8,
  },
  micContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    alignItems: 'center',
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
  summaryContainer: {
    position: 'absolute',
    width: width * 0.4,
    padding: 16,
    top: 320,
    left: 20,
    backgroundColor: '#ded1ff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 7,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#531ea3',
    marginTop: 8,
  },
  emotionText: {
    fontSize: 13,
    color: '#333',
    marginVertical: 4,
    lineHeight: 18,
  },
  summaryText: {
    fontSize: 13,
    color: '#000',
    marginTop: 4,
    lineHeight: 18,
  },
});

export default Conversation;
