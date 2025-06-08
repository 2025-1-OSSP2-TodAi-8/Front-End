/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

type EmotionData = { date: string; emotion: string };

type Props = {
  year: number;
  month: number;
  emotionData: EmotionData[];
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  emotionImageMap: { [key: string]: any };
};

const CalendarGrid = ({
  year,
  month,
  emotionData,
  selectedDate,
  setSelectedDate,
  emotionImageMap,
}: Props) => {
  // 해당 달의 일수
  const daysInMonth = new Date(year, month, 0).getDate();

  // 해당 달의 첫 번째 요일 (0=일요일 … 6=토요일)
  const firstDay = new Date(year, month - 1, 1).getDay();

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // ───────────────────────────────────────────────────────────────────
  // 숫자로 오늘을 계산하기
  const today = new Date();
  const todayYearNum = today.getFullYear();
  const todayMonthNum = today.getMonth() + 1; // JS의 getMonth()는 0~11 이므로 +1
  const todayDateNum = today.getDate();

  // ───────────────────────────────────────────────────────────────────
  // 날짜별 감정 찾기 (원래대로 문자열 비교)
  const getEmotionByDate = (day: number) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    const found = emotionData.find((item) => item.date === dateString);
    return found ? found.emotion : null;
  };

  // ───────────────────────────────────────────────────────────────────
  // 개별 날짜 렌더링 함수
  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      // 빈 칸
      return <View key={`empty-${index}`} style={styles.emptyBox} />;
    }

    // “YYYY-MM-DD” 포맷 (선택된 날짜 체크용)
    const mmStr = String(month).padStart(2, '0');
    const ddStr = String(day).padStart(2, '0');
    const dateString = `${year}-${mmStr}-${ddStr}`;

    const emotion = getEmotionByDate(day);
    const isSelected = selectedDate === dateString;

    // 숫자 비교로 오늘인지 판단
    const isToday =
      year === todayYearNum &&
      month === todayMonthNum &&
      day === todayDateNum;

    return (
      <TouchableOpacity
        key={day}
        onPress={() => {
          if (isSelected) {
            setSelectedDate('');
          } else {
            setSelectedDate(dateString);
          }
        }}
        style={styles.dayWrapper}
      >
        <View
          style={[
            styles.circle,
            isToday && !isSelected && styles.todayCircle,   // “오늘” 테두리
            isSelected && styles.selectedCircle,            // “선택된 날짜” 테두리
          ]}
        >
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
          <Image
            source={require('../../assets/images/today.png')}
            style={styles.todayBadge}
          />
        )}
      </TouchableOpacity>
    );
  };

  // ───────────────────────────────────────────────────────────────────
  // 달력을 그릴 배열: 첫날 이전은 null, 그 뒤로 1~daysInMonth
  const dayArray = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.wrapper}>
      {/* 요일 헤더 */}
      <View style={styles.weekRow}>
        {weekDays.map((wd) => (
          <Text key={wd} style={styles.weekDay}>
            {wd}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.grid}>
        {dayArray.map((day, idx) => renderDay(day, idx))}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const boxSize = width / 8.5;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  weekRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  weekDay: {
    width: boxSize,
    marginHorizontal: 2,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 10,
  },
  dayWrapper: {
    width: boxSize,
    height: boxSize + 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 2,
    position: 'relative',
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: '#6A0DAD',
  },
  emojiImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  dateUnderEmoji: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 0,
  },
  dateOnlyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  emptyBox: {
    width: boxSize,
    height: boxSize,
    marginHorizontal: 2,
  },
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
  todayCircle: {
    borderWidth: 2,
    borderColor: '#DCBEFA',
  },
});

export default CalendarGrid;
