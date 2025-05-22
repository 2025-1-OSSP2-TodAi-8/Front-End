import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

type EmotionData = { date: string; emotion: string };

type Props = {
  year: number;
  month: number;
  emotionData: EmotionData[];
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  emotionEmojiMap: { [key: string]: string };
};

const CalendarGrid = ({
  year,
  month,
  emotionData,
  selectedDate,
  setSelectedDate,
  emotionEmojiMap,
}: Props) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0(일) ~ 6(토)

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 오늘 날짜 계산
  const todayString = '2025-05-22';

  const getEmotionByDate = (day: number) => {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return emotionData.find((item) => item.date === dateString)?.emotion ?? null;
  };

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.emptyBox} />;
    }

    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const emotion = getEmotionByDate(day);
    const emoji = emotion ? emotionEmojiMap[emotion] : null;
    const isSelected = selectedDate === dateString;
    const isToday = dateString === todayString;

    return (
      <TouchableOpacity
        key={day}
        onPress={() => {
          if (selectedDate === dateString) {
            setSelectedDate('');
          } else {
            setSelectedDate(dateString);
          }
        }}
        style={styles.dayWrapper}
      >
        <View style={[styles.circle, isSelected && !isToday && styles.selectedCircle]}>
          {emoji ? (
            <>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.dateUnderEmoji}>{day}</Text>
            </>
          ) : (
            <Text style={styles.dateOnlyText}>{day}</Text>
          )}
        </View>
        {isToday && (
          <Image source={require('../../assets/images/today.png')} style={styles.todayBadge} />
        )}
      </TouchableOpacity>
    );
  };

  const dayArray = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>
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
    justifyContent: 'flex-start', // ✅ 날짜와 동일하게
    width: '100%',
  },
  weekDay: {
    width: boxSize,
    marginHorizontal: 2, // ✅ 날짜 셀과 동일한 마진
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 0,
  },
  dayWrapper: {
    width: boxSize,
    height: boxSize + 12,  // 조금 더 높게
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 2, // ✅ 살짝 여백 주기만 하면 딱 떨어짐
    position: 'relative',
  },
  circle: {
    width: 46,             // 원 크기 확대
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
  emoji: {
    fontSize: 20,
    marginBottom: -2,        // 이모지도 더 큼직하게
  },
  dayText: {
    fontSize: 16,          // 숫자도 조금 키움
    color: '#333',
  },
  emptyBox: {
    width: boxSize,
    height: boxSize,
    marginHorizontal: 2, // ✅ 날짜 셀과 똑같이 줘야 정렬이 맞음!
  },
  emojiWithDate: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 28,
  },
  dateUnderEmoji: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 0,      // 여유 간격 없앰
  },
  dateOnlyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  todayBadge: {
    width: 48,
    height: 24,
    resizeMode: 'contain',
    position: 'absolute',
    top: -18,
    left: '50%',
    transform: [{ translateX: -24 }],
    zIndex: 2,
  },
});

export default CalendarGrid;
