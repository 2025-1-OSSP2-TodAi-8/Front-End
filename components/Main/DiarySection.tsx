import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

type EmotionData = { date: string; emotion: string };

type Props = {
  selectedDate: string | null;
  emotionData: EmotionData[];
  emotionEmojiMap: { [key: string]: string };
  onPressHeader: () => void;
};

const getWeekday = (dateStr: string) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(dateStr);
  return days[d.getDay()];
};

const DiarySection = ({ selectedDate, emotionData, emotionEmojiMap, onPressHeader }: Props) => {
  if (!selectedDate) return null;

  const emotion = emotionData.find((item) => item.date === selectedDate)?.emotion ?? null;
  const [_, month, day] = selectedDate.split('-');
  const weekday = getWeekday(selectedDate);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPressHeader} activeOpacity={0.7}>
        <Text style={styles.header}>
          {emotion && `${emotionEmojiMap[emotion] || '❓'} `}{month}.{day} ({weekday})
        </Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        multiline
        placeholder="오늘의 일기를 작성해보세요..."
        placeholderTextColor="#aaa"
        editable={true} // ✅ 입력 가능
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6A0DAD',
    marginBottom: 10,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
});

export default DiarySection;
