import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const emotionEmojiMap: { [key: string]: string } = {
  중립: '😐',
  놀람: '😲',
  화남: '😠',
  행복: '😊',
  슬픔: '😢',
  혐오: '🤢',
  공포: '😱',
};

type Props = {
  date: string;
  emotion: string;
  content: string;
  onBack: () => void;
};

const DiaryDetailScreen = ({ date, emotion, content, onBack }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {emotionEmojiMap[emotion] || '❓'} {date}
      </Text>
      <Text style={styles.content}>{content || '작성된 일기가 없습니다.'}</Text>
      <Button title="돌아가기" onPress={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5E8FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
});

export default DiaryDetailScreen;
