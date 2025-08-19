/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Alert,
} from 'react-native';
import API from '../../../api/axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type EmotionData = { date: string; emotion: string };

type Props = {
  year: number;
  month: number;
  emotionData: EmotionData[];
  emotionImageMap: { [key: string]: any };
  userCode: string; // ✅ 변경: targetUserId 제거, userCode 사용
};

const CalendarGrid_G = ({ year, month, emotionData, emotionImageMap, userCode }: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [overlayText, setOverlayText] = useState<string>('');
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (showOverlay) {
      Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
            () => setShowOverlay(false)
          );
        }, 2000);
      });
    }
  }, [showOverlay, overlayOpacity]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth() + 1;
  const todayD = today.getDate();

  const getEmotionItemByDate = (day: number) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const key = `${year}-${mm}-${dd}`;
    return emotionData.find((it) => it.date === key);
  };

  const handleDayPress = async (dateString: string) => {
    try {
      const dayNum = Number(dateString.split('-')[2]);

      // ✅ 새 형식: /api/people/sharing/day/{yyyy-mm-dd} + body에 userCode 전송
      const res = await API.post(`/api/people/sharing/day/${dateString}`, {
        userCode, // 서버가 targetId로 받으면 { targetId: userCode } 로 변경
      });

      // 공개 여부 확인(백엔드 스펙에 맞춰 유지)
      const 공개 = res.data?.공개 ?? res.data?.data?.공개;
      if (공개 === false) {
        setOverlayText('비공개 일기입니다.');
        setShowOverlay(true);
        return;
      }

      // ✅ 상세 화면으로 이동 시에도 userCode 사용
      navigation.navigate('DiaryAnalyze_G', {
        date: dateString,
        userCode,
        day: dayNum,
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setOverlayText('해당 날짜에 감정 데이터가 없습니다.');
        setShowOverlay(true);
      } else {
        console.warn('날짜 조회 실패:', err?.response?.data || err?.message || err);
        Alert.alert('오류', '해당 날짜 데이터를 불러오지 못했습니다.');
      }
    }
  };

  const renderDay = (day: number | null, idx: number) => {
    if (day === null) return <View key={`empty-${idx}`} style={styles.emptyBox} />;

    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;

    const item = getEmotionItemByDate(day);
    const emotion = item?.emotion ?? null;

    const isToday = year === todayY && month === todayM && day === todayD;

    return (
      <TouchableOpacity key={day} onPress={() => handleDayPress(dateString)} style={styles.dayWrapper}>
        <View style={[styles.circle, isToday && styles.todayCircle]}>
          {emotion && emotionImageMap[emotion] ? (
            <>
              <Image source={emotionImageMap[emotion]} style={styles.emojiImg} />
              <Text style={styles.dateUnderEmoji}>{day}</Text>
            </>
          ) : (
            <Text style={styles.dateOnlyText}>{day}</Text>
          )}
        </View>
        {isToday && (
          <Image source={require('../../../assets/images/today.png')} style={styles.todayBadge} />
        )}
      </TouchableOpacity>
    );
  };

  const dayArray = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.weekRow}>
        {weekDays.map((wd) => (
          <Text key={wd} style={styles.weekDay}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>{dayArray.map((day, idx) => renderDay(day, idx))}</View>

      {showOverlay && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={styles.overlayBox}>
            <Text style={styles.overlayText}>{overlayText}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const boxSize = width / 8.5;

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  weekRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%' },
  weekDay: { width: boxSize, marginHorizontal: 2, textAlign: 'center', fontWeight: 'bold', color: '#555' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%', paddingTop: 10 },
  dayWrapper: {
    width: boxSize,
    height: boxSize + 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 2,
    position: 'relative',
  },
  circle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  todayCircle: { borderWidth: 2, borderColor: '#DCBEFA' },
  emojiImg: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 0 },
  dateUnderEmoji: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 0 },
  dateOnlyText: { fontSize: 16, color: '#333', textAlign: 'center' },
  emptyBox: { width: boxSize, height: boxSize, marginHorizontal: 2 },
  todayBadge: {
    width: 48,
    height: 24,
    resizeMode: 'contain',
    position: 'absolute',
    top: -16,
    left: '50%',
    transform: [{ translateX: -24 }],
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    top: height * 0.2,
    width: width * 0.8,
    left: width * 0.1, // 가운데 정렬
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBox: { width: '100%', alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 14, textAlign: 'center' },
});

export default CalendarGrid_G;
