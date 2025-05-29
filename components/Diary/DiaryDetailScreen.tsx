import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Image } from 'react-native';
import DiaryDetailActions from './DiaryDetailActions';

const emotionImageMap: { [key: string]: any } = {
  중립: require('../../assets/images/neutral2.png'),
  놀람: require('../../assets/images/surprise2.png'),
  화남: require('../../assets/images/angry2.png'),
  행복: require('../../assets/images/happy2.png'),
  슬픔: require('../../assets/images/sad2.png'),
  혐오: require('../../assets/images/disgust2.png'),
  공포: require('../../assets/images/fear2.png'),
};

type Props = {
  date: string;
  onBack: (payload: { year: number; month: number; date: string }) => void;
};

const DIARY_API_URL = 'https://4c309c98-3beb-4459-a9b0-04c1e3cbf046.mock.pstmn.io/api/emotions';

function getPrevDate(dateStr: string) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function getNextDate(dateStr: string) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function padDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return [y, m.padStart(2, '0'), d.padStart(2, '0')].join('-');
}

const DiaryDetailScreen = ({ date, onBack }: Props) => {
  const [currentDate, setCurrentDate] = useState(date);
  const [emotion, setEmotion] = useState('');
  const [year, month, day] = currentDate.split('-');
  const formattedDate = `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;

  const statusMessage = '오늘은 어떤 하루를 보냈을까요?';
  const [diaryText, setDiaryText] = useState<string | null>(null);

  useEffect(() => {
    fetch(DIARY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ 서버 응답:', JSON.stringify(data)); // 전체 응답 출력
        setDiaryText(data?.content || null);

        const paddedDate = padDate(currentDate);
        const found = data?.emotions?.find((e: any) => padDate(e.date) === paddedDate);
        console.log('🔍 찾은 감정:', found);

        const emotionText = found?.emotion?.toString().trim() || '';
        console.log('🧠 감정 텍스트:', emotionText);
        setEmotion(emotionText);
      })
      .catch(err => {
        console.error('❌ fetch 실패:', err);
        setDiaryText(null);
        setEmotion('');
      });
  }, [currentDate]);

  const diaryContent = diaryText ?? '오늘 하루는 기록하지 않으셨네요';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 100 }}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              const [y, m] = currentDate.split('-').map(Number);
              onBack({ year: y, month: m, date: currentDate });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.grayDate}>{formattedDate}</Text>
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.emojiRow}>
              <TouchableOpacity onPress={() => setCurrentDate(getPrevDate(currentDate))} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>
              <Image
                source={
                  emotionImageMap[emotion.trim()]
                    ? emotionImageMap[emotion.trim()]
                    : require('../../assets/images/empty.png')
                }
                style={styles.emojiImg}
              />
              <TouchableOpacity onPress={() => setCurrentDate(getNextDate(currentDate))} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.statusText}>오늘의 감정상태는...</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.statusMessage}>{statusMessage}</Text>
            <Text style={styles.diaryText}>{diaryContent}</Text>
            {!emotion && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => Alert.alert('녹음하러 가기', '녹음 페이지로 이동(추후 구현)')}
              >
                <Text style={styles.recordButtonText}>녹음하러 가기</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.listenButton}
            onPress={() => Alert.alert('녹음 다시듣기', '녹음 다시듣기 기능(추후 구현)')}
          >
            <Text style={styles.listenButtonText}>녹음 다시듣기</Text>
            <Image source={require('../../assets/images/record.png')} style={styles.listenIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <DiaryDetailActions date={currentDate} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 90,
  },
  emojiImg: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#6A0DAD',
    marginBottom: 12,
    marginTop: 24,
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
    position: 'relative',
    paddingBottom: 80,
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
  grayDate: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
    fontWeight: '400',
  },
  recordButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#B39DDB',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B39DDB',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
    alignSelf: 'center',
  },
  listenButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  listenIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  arrowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 90,
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 32,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#F5E8FF',
    borderTopWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
});

export default DiaryDetailScreen;
