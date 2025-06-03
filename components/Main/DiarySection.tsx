import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EmotionData = { date: string; emotion: string };

type Props = {
  selectedDate: string | null;
  emotionData: EmotionData[];
  emotionImageMap: { [key: string]: any };
  onPressHeader: () => void;
};

const getWeekday = (dateStr: string) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(dateStr).getDay()];
};

const DiarySection = ({ selectedDate, emotionData, emotionImageMap, onPressHeader }: Props) => {
  const [content, setContent] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadDiary = async () => {
      if (!selectedDate) return;
      try {
        const saved = await AsyncStorage.getItem(`diary_${selectedDate}`);
        setContent(saved || '');
        console.log('📥 불러온 일기:', saved);
      } catch (e) {
        console.error('불러오기 실패:', e);
        setContent('');
      }
    };
    loadDiary();
  }, [selectedDate]);

  const handleChange = (text: string) => {
    setContent(text);

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      if (selectedDate) {
        AsyncStorage.setItem(`diary_${selectedDate}`, text)
          .then(() => console.log('✅ 자동 저장 완료'))
          .catch((err) => console.error('❌ 저장 실패:', err));
      }
    }, 1500); // 1.5초 후 자동 저장

    setTypingTimeout(timeout);
  };

  if (!selectedDate) return null;

  const emotion = emotionData.find((item) => item.date === selectedDate)?.emotion ?? null;
  const [_, month, day] = selectedDate.split('-');
  const weekday = getWeekday(selectedDate);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPressHeader} activeOpacity={0.7} disabled={!onPressHeader}>
        <View style={styles.headerContainer}>
          {emotion && emotionImageMap[emotion] ? (
            <Image source={emotionImageMap[emotion]} style={styles.emotionImage} />
          ) : (
            <Text style={styles.headerText}>❓</Text>
          )}
          <Text style={styles.headerText}>{month}.{day} ({weekday})</Text>
        </View>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        multiline
        placeholder="오늘의 일기를 작성해보세요..."
        placeholderTextColor="#aaa"
        value={content}
        onChangeText={handleChange}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    color: '#6A0DAD',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
});

export default DiarySection;