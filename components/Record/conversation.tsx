/* eslint-disable react-native/no-inline-styles */
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
  ActivityIndicator,
} from 'react-native';
import AudioRecorder from './VoiceRecorder';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import WaveForm from './WaveForm'

const { width } = Dimensions.get('window');

interface Props {
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}

const Conversation: React.FC<Props> = ({ setUserToken, setUserType }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dateParam = route.params?.date;

  const [showQuestion, setQuestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStart, setRecordStart] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [decibel, setDecibel] = useState(0);

  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [emotionArray, setEmotionArray] = useState<number[]>([]);

  const [questionAnimation] = useState(new Animated.Value(0));
  const [userRecordingAnimation] = useState(new Animated.Value(0));
  const [summaryAnimation] = useState(new Animated.Value(0));

  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');

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
  }, [questionAnimation, showQuestion]);

  const toggleRecording = () => {
    setIsRecording(prev => {
      const newState = !prev;
      if (newState) {
        setRecordStart(true);
        userRecordingAnimation.setValue(0);
        Animated.timing(userRecordingAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      return newState;
    });
  };

  const resetRecordingState = () => {
    setRecordStart(false);       // 파형 숨기기
    setShowSummary(false);
    setSummaryText(null);
    setEmotionArray([]);
    setQuestion(false); // 질문도 다시 보여줄 거면 이거 유지
    setTimeout(() => setQuestion(true), 150); // 질문 애니메이션 재실행
  };

  const handleServerResult = (result: {
    success: number;
    emotion: number[];
    summary: string;
    message?: string;
  }) => {
    setIsLoading(false);
    if (result.success === 1) {
      setSummaryText(result.summary && result.summary.trim().length > 0 ? result.summary : null);
      setEmotionArray(result.emotion || []);
      summaryAnimation.setValue(0);
      Animated.timing(summaryAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setShowSummary(true);
    } else {
      setOverlayText('너무 짧습니다!\n오늘 하루에 대해 좀 더 말해주세요');
      setShowOverlay(true);
      resetRecordingState();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
      <WithMenuLayout setUserToken={setUserToken} setUserType={setUserType}>
        <SafeAreaView style={styles.container}>
          {!menuVisible && (
            <MenuIcon isOpen={false} onPress={() => setMenuVisible(true)} />
          )}
          <View style={styles.header}>
            <Text style={styles.title}>TodAi</Text>
          </View>
          {menuVisible && (
            <MenuBar
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              onFavorites={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
              }}
              setUserToken={setUserToken}
              setUserType={setUserType}
              isOpen={menuVisible}
              toggleMenu={() => setMenuVisible(false)}
            />
          )}
          <View style={styles.divider1} />

          <View style={styles.middle}>
            {dateParam && (
              <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Text style={styles.dateText}>
                  {`${dateParam.slice(0, 4)}년 ${parseInt(dateParam.slice(5, 7), 10)}월 ${parseInt(dateParam.slice(8, 10), 10)}일`}
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

          <View style={styles.micContainer}>
            <View style={styles.divider2} />
            <TouchableOpacity onPress={() => {
              setIsLoading(true);
              toggleRecording();
            }} style={styles.micButton}>
              <Image source={require('../../assets/images/mic.png')} style={styles.mic} />
            </TouchableOpacity>
          </View>

          <AudioRecorder
            start={isRecording}
            onResult={handleServerResult}
            onVolumeChange={(db) => setDecibel(db)}

          />

            {recordStart && (
              <Animated.View style={[styles.userRecording, { opacity: userRecordingAnimation }]}>
                <WaveForm decibel={decibel} />
              </Animated.View>
            )}

          {isLoading && <ActivityIndicator size="large" color="#531ea3" style={{ marginTop: 20 }} />}

          {showSummary && (
            <Animated.View style={[styles.summaryContainer, { opacity: summaryAnimation }]}>
              <Text style={styles.summaryTitle}>오늘의 Emotion:</Text>
              <Text style={styles.emotionText}>
                {emotionArray.length
                  ? emotionArray
                      .map((val, idx) => {
                        const labels = ['행복', '슬픔', '화남', '놀람', '공포', '혐오'];
                        return `${labels[idx]}: ${(val * 100).toFixed(1)}%`;
                      })
                      .join('  ')
                  : '감정 정보를 불러올 수 없습니다.'}
              </Text>

              <Text style={styles.summaryTitle}>요약:</Text>
              <Text style={styles.summaryText}>
                {summaryText && summaryText.trim().length > 0
                  ? summaryText
                  : '@님의 오늘 이야기를 불러올 수 없습니다.'}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  resetRecordingState(); // 초기화
                  setTimeout(() => {
                    setRecordStart(true);     // 🔁 다시 트리거
                    setIsRecording(true);     // 녹음 시작
                  }, 300); // 짧은 딜레이를 줘야 렌더링 감지됨
                }}
                style={styles.redoButton}
              >
                <Text style={styles.redoButtonText}>다시 녹음하기</Text>
            </TouchableOpacity> 
            </Animated.View>
          )}
        </SafeAreaView>

        {showOverlay && (
          <View style={styles.overlay}>
            <View style={styles.overlayBox}>
              <Text style={styles.overlayText}>{overlayText}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowOverlay(false);
                    resetRecordingState();
                    setIsRecording(true);
                  }}
                  style={styles.overlayButton}
                >
                  <Text style={styles.overlayButtonText}>다시 녹음</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowOverlay(false);
                    resetRecordingState();
                  }}
                  style={[styles.overlayButton, { backgroundColor: '#aaa' }]}
                >
                  <Text style={styles.overlayButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  overlayText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  overlayButton: {
    backgroundColor: '#531ea3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  overlayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  redoButton: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#531ea3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  redoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Conversation;
