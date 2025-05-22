import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DiaryDetailActions from './DiaryDetailActions';

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
  // 날짜 포맷 변환 (2025-03-07 → 2025년 3월 7일)
  const [year, month, day] = date.split('-');
  const formattedDate = `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;

  // 감정 상태 메시지(더미)
  const statusMessage = '오늘은 정말 좋은 하루를 보내셨네요!';
  const diaryText = content || '가고 싶었던 식당에서 점심을 먹고,\n저녁에는 날씨가 좋아 반려견과 산책을 하셨네요.\n5월 1일에 친구와 카페를 가는 약속을 잡았어요.';

  return (
    <View style={styles.container}>
      {/* 상단 감정/날짜/상태 */}
      <View style={styles.headerSection}>
        <Text style={styles.emoji}>{emotionEmojiMap[emotion] || '❓'}</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.statusText}>오늘의 감정상태는...</Text>
      </View>
      {/* 감정 상태 메시지 및 일기 */}
      <View style={styles.contentSection}>
        <Text style={styles.statusMessage}>{statusMessage}</Text>
        <Text style={styles.diaryText}>{diaryText}</Text>
      </View>
      {/* 하단 버튼 영역 */}
      <DiaryDetailActions onBack={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8FF',
    padding: 0,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    color: '#6A0DAD',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#6A0DAD',
    marginBottom: 12,
  },
  contentSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusMessage: {
    fontSize: 16,
    color: '#6A0DAD',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  diaryText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DiaryDetailScreen;
