/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import API from '../../../api/axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import YearMonthSelector from './YearMonthSelector_G';
import CalendarGrid from './CalendarGrid_G';
import Request_bar from '../Request_bar';
import { useLink } from '../LinkContext';

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../../assets/images/surprise.png'),
  화남: require('../../../assets/images/angry.png'),
  행복: require('../../../assets/images/happy.png'),
  슬픔: require('../../../assets/images/sad.png'),
  혐오: require('../../../assets/images/disgust.png'),
  공포: require('../../../assets/images/fear.png'),
};

type MainNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

type EmotionData = {
  date: string;
  emotion: string;
};

const MainScreen_G: React.FC<{
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}> = ({ setUserToken, setUserType }) => {

  const navigation = useNavigation<MainNavProp>();
  const { targetIdNum, targetIdStr, setLink } = useLink();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(5);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkLinkMessage, setCheckLinkMessage] = useState('연동 확인');
  const [summaryMessage, setSummaryMessage] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, []);

  const handleLogout = useCallback(() => {
    setUserToken(null);
    setUserType(null);       // ✅ 사용자 타입 초기화 추가
    setMenuVisible(false);
  }, [setUserToken, setUserType]);

  const showTempNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchMonthlyEmotions = async () => {
    setLoading(true);
    try {
      if (!targetIdNum || !targetIdStr) {
        console.warn('연동된 타깃 ID가 없습니다.');
        setEmotionData([]);
        return;
      }

      const res = await API.post('/api/people/share/month', {
        user_id: targetIdNum,
        year,
        month,
      });

      if (res.status === 200 && Array.isArray(res.data.emotions)) {
        const enriched = res.data.emotions.map((e: any) => ({
          date: e.date,
          emotion: e.emotion,
        }));
        setEmotionData(enriched);
        console.log('[감정 데이터 확인]', enriched);
      
        // ✅ 기본 문구 한 번만 설정
        let summary = '특별한 감정 변화가 나타나지 않습니다.';
      
        // 🔁 연속 부정 감정(슬픔/화남/혐오) 4일 이상 체크
        const negativeEmotions = ['슬픔', '화남', '혐오'];
        const filteredDates = enriched
          .filter((e: { emotion: string }) => negativeEmotions.includes(e.emotion))
          .map((e: { date: string }) => new Date(e.date))
          .filter((d: Date) => d.getTime() <= new Date().setHours(0, 0, 0, 0))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
        let count = 1;
        let start: Date | null = null;
        let end: Date | null = null;
      
        for (let i = 1; i < filteredDates.length; i++) {
          const diff = filteredDates[i].getTime() - filteredDates[i - 1].getTime();
          if (diff === 86400000) {
            count++;
            if (count === 2) start = filteredDates[i - 1];
            end = filteredDates[i];
          } else {
            if (count >= 4) break;
            count = 1;           // ✅ 새 구간 시작이므로 1로 리셋
            start = null;
            end = null;
          }
        }
      
        // ✅ 마지막까지 연속이면 반영
        if (count >= 4 && start && end) {
          const format = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
          const today = new Date();
          const isEndToday =
            end.getFullYear() === today.getFullYear() &&
            end.getMonth() === today.getMonth() &&
            end.getDate() === today.getDate();
      
          summary = isEndToday
            ? `${format(start)}부터 오늘까지\n부정적인 감정이 기록되었습니다.`
            : `${format(start)}부터 ${format(end)}까지\n${Math.round((end.getTime() - start.getTime()) / 86400000) + 1}일간 부정적 감정이 기록되었습니다.`;
        }
      
        setSummaryMessage(summary); // ✅ 최종 한 번만 세팅
      } else {
        setEmotionData([]);
        setSummaryMessage('특별한 감정 변화가 나타나지 않습니다.');
      }
      
    } catch (error: any) {
      if (error.response?.status === 403) {
        setEmotionData([]);
        showTempNotification('아직 대상 사용자가 연동 요청을 수락하지 않았습니다.');
      } else {
        console.warn('월별 감정 불러오기 실패:', error);
        setEmotionData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetIdNum !== null && targetIdStr) {
      fetchMonthlyEmotions();
    }
  }, [targetIdNum, targetIdStr]);

  const checkLinkStatus = () => {
    setChecking(true);
    if (!targetIdStr) {
      setCheckLinkMessage('연동된 사용자 없음');
    } else {
      setCheckLinkMessage(`${targetIdStr} 사용자 연동 중`);
    }
    setTimeout(() => {
      setCheckLinkMessage('연동 확인');
      setChecking(false);
    }, 3000);
  };

  const goToFavorites = () => {
    navigation.navigate('FavoriteYear');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.checkLinkWrapper}>
        <TouchableOpacity onPress={checkLinkStatus} disabled={checking}>
          <Text style={styles.checkLinkText}>{checkLinkMessage}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginTop: 10 }}>
          <YearMonthSelector year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
          <CalendarGrid
            year={year}
            month={month}
            emotionData={emotionData}
            emotionImageMap={emotionImageMap}
            targetUserId={targetIdNum ?? 0}
          />
        </View>

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6A0DAD" />
            <Text style={styles.loadingText}>월별 감정을 불러오는 중...</Text>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{summaryMessage}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.checkButtonContainer} onPress={fetchMonthlyEmotions}>
            <Text style={styles.checkButtonText}>TodAi</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToFavorites}>
            <Image
              source={require('../../../assets/images/emotion-box.png')}
              style={styles.emotionIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.requestButton} onPress={() => setMenuVisible(true)}>
        <Image source={require('../../../assets/images/request.png')} style={styles.requestIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Image source={require('../../../assets/images/logout.png')} style={styles.logoutIcon} />
      </TouchableOpacity>

      <Request_bar
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLinkStatus={(success: boolean) => {
          if (success) {
            showTempNotification('연동 요청을 보냈습니다. 대상 사용자가 수락하면 데이터를 볼 수 있습니다.');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E1FF',
  },
  checkLinkWrapper: {
    alignItems: 'center',
    marginTop: 60,
  },
  checkLinkText: {
    fontSize: 12,
    color: '#AA9DB0FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  loadingOverlay: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  summaryContainer: {
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#4B148F',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    top: 60,
    gap: 16,
  },
  checkButtonContainer: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkButtonText: {
    fontSize: 16,
    color: '#4B148F',
    fontWeight: '800',
  },
  emotionIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  requestButton: {
    position: 'absolute',
    top: 70,
    left: 30,
  },
  requestIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  logoutButton: {
    position: 'absolute',
    top: 70,
    right: 30,
  },
  logoutIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
});

export default MainScreen_G;

