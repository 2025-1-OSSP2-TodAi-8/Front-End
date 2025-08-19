/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Gaurdian/DiaryAndAnalyze/DiaryAndAnalyzeScreen_G.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import API from '../../../api/axios';

// React Navigation 훅·타입
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AppNavigator에 정의된 RootStackParamList import
import type { RootStackParamList } from '../../../navigation/AppNavigator';

// 차트와 감정 뷰 컴포넌트
import DiaryRadarChartView from './chart/DiaryRadarChartView_G';
import DiaryEmotionView from '../DiaryAndAnalyze_G/emotion/DiaryEmotionView_G';

// “DiaryAnalyze_G” 화면의 route prop 타입
// 이 화면의 params에 date(string)와 target_user_id(number)이 포함되어야 합니다.
type AnalyzeRouteProp = RouteProp<RootStackParamList, 'DiaryAnalyze_G'>;
type AnalyzeNavProp = NativeStackNavigationProp<RootStackParamList, 'DiaryAnalyze_G'>;

// 일별 조회용 API 엔드포인트 (baseURL은 API 인스턴스에 설정되어 있습니다)
const EMOTION_DAY_PATH = '/api/people/sharing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const EMOTION_DAY_STATE = {
  emotion: '', 
  emotion_rate: [0, 0, 0, 0, 0, 0, 0], 
  summary: '', 
}

const DiaryAndAnalyzeScreen_G: React.FC = () => {
  const navigation = useNavigation<AnalyzeNavProp>();
  const route = useRoute<AnalyzeRouteProp>();

  const { date: initialDate, userCode } = route.params;

  const [showChart, setShowChart] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [todayEmotion, setTodayEmotion] = useState<typeof EMOTION_DAY_STATE | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOneDayEmotion = async (year: number, month: number, day: number) => {
    try {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const requestUrl = `${EMOTION_DAY_PATH}/${year}-${monthStr}-${dayStr}`;
      const payload = {
        targetId: userCode,
      };
      console.log('[DiaryAnalyze_G] 일별 감정 조회 요청 payload →', payload);
      const response = await API.post(requestUrl, payload);

      console.log('[DiaryAnalyze_G] 서버 응답 데이터 →', response.data);

      if(response.status === 200 && response.data.success) {
        const data = response.data.data;
        if(response.data.message || !data) {
          return EMOTION_DAY_STATE;
        }
        return {
          emotion: data.emotion || '',
          emotion_rate: Array.isArray(data.emotionRate) ? data.emotionRate : EMOTION_DAY_STATE.emotion_rate,
          summary: data.summary??'', 
        };
      }

      return EMOTION_DAY_STATE; 
    } catch (err: any) {
      if (err.response?.status === 404) {
       return EMOTION_DAY_STATE;
      }
      console.error("API Error: ", err);
      return {
        error: '데이터 조회 중 오류가 발생했습니다. '
      };
    }
  };

  useEffect(() => {
    const [yStr, mStr, dStr] = currentDate.split('-');
    const year = Number(yStr);
    const month = Number(mStr);
    const day = Number(dStr);

    setLoading(true);
    setErrorMessage(null);

    fetchOneDayEmotion(year, month, day)
      .then((result: any) => {
        if (result) {
          setTodayEmotion(result);
        }
      })
      .finally(() => setLoading(false));
  }, [currentDate]);

  const onPrevDate = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };
  const onNextDate = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const onDatePress = () => {
    navigation.navigate('MainScreen_G', {
      userCode: userCode, 
    });
  };

  const handleSendMessage = () =>{
    navigation.navigate('SendMessage', {userCode: userCode});
  };

  const [yStr2, mStr2, dStr2] = currentDate.split('-');
  const formattedDate = `${yStr2}년 ${parseInt(mStr2, 10)}월 ${parseInt(dStr2, 10)}일`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={onDatePress}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subHeaderWrapper}>
        <Text style={styles.subtitleText}>오늘의 감정 상태는…</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowChart((prev) => !prev)}
        style={styles.chartToggleWrapper}
      >
        <Image
          source={
            showChart
              ? require('../../../assets/images/emotion.png')
              : require('../../../assets/images/Chart.png')
          }
          style={styles.chartToggleIcon}
        />
      </TouchableOpacity>

      <View style={styles.bodyWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color="#6A0DAD" />
        ) : errorMessage ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>{errorMessage}</Text>
          </View>
        ) : todayEmotion ? (
          showChart ? (
            <DiaryRadarChartView
              emotion={todayEmotion.emotion_rate}
              text={todayEmotion.summary}
            />
          ) : (
            <DiaryEmotionView
              emotion={todayEmotion.emotion}
              text={todayEmotion.summary}
              onPrevDate={onPrevDate}
              onNextDate={onNextDate}
              currentDate={currentDate}
            />
          )
        ) : (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>데이터가 존재하지 않습니다.</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
          <Text style={styles.messageButtonText}>메세지 보내기</Text>
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <View style={styles.overlayContainer}>
          <View style={styles.overlayBox}>
            <Text style={styles.overlayText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => setErrorMessage(null)}
            >
              <Text style={styles.overlayButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8FF',
  },
  headerWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    position: 'relative',
  },
  dateText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  subHeaderWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  subtitleText: {
    fontSize: 20,
    color: '#6A0DAD',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartToggleWrapper: {
    position: 'absolute',
    top: 80,
    right: 35,
    zIndex: 10,
  },
  chartToggleIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  bodyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  overlayButton: {
    marginTop: 8,
    backgroundColor: '#6A0DAD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  overlayButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#F5E8FF', 
    marginBottom: 30, 
    alignItems: 'center', 
  }, 
  messageButton: {
    backgroundColor: '#C8A2C8', 
    paddingVertical: 16, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '80%', 
  }, 
  messageButtonText: {
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
  }, 
});

export default DiaryAndAnalyzeScreen_G;

