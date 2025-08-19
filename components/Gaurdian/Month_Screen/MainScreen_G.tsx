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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import YearMonthSelector from './YearMonthSelector_G';
import CalendarGrid from './CalendarGrid_G';
import Request_bar from '../Request_bar';

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../../assets/images/surprise.png'),
  화남: require('../../../assets/images/angry.png'),
  행복: require('../../../assets/images/happy.png'),
  슬픔: require('../../../assets/images/sad.png'),
  혐오: require('../../../assets/images/disgust.png'),
  공포: require('../../../assets/images/fear.png'),
};

// ✅ 라우트/네비 타입: 라우트 이름은 "Main"
type MainRouteProp = RouteProp<RootStackParamList, 'MainScreen_G'>;
type MainNavProp   = NativeStackNavigationProp<RootStackParamList, 'MainScreen_G'>;

type EmotionData = { date: string; emotion: string };

const MainScreen_G: React.FC<{
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}> = ({ setUserToken, setUserType }) => {
  const navigation = useNavigation<MainNavProp>();
  const route = useRoute<MainRouteProp>();
  const { userCode } = route.params; // 🔹 DashBoard_Connected_User에서 받아온 코드

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
    setUserType(null);
    setMenuVisible(false);
  }, [setUserToken, setUserType]);

  const showTempNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ 월별 감정 조회: userCode를 바디에 포함해서 전송
  const fetchMonthlyEmotions = async () => {
    setLoading(true);
    try {
      if (!userCode) {
        console.warn('userCode가 없습니다.');
        setEmotionData([]);
        setSummaryMessage('특별한 감정 변화가 나타나지 않습니다.');
        return;
      }
      

      const ym = `${year}-${String(month).padStart(2, '0')}`;

      // ⬇️ 서버가 기대하는 키 이름이 'targetId'가 아니라 'userCode'라면 아래 줄을 바꿔주세요.
      const res = await API.post(`/api/people/sharing/month/${ym}`, {
        targetId:userCode, // ← 백엔드 키가 targetId라면 { targetId: userCode }
      });

      console.log('[REQ/MONTH]', {
        method: 'POST',
        url: `/api/people/sharing/month/${ym}`,
        body: { userCode },
        baseURL: API.defaults?.baseURL,
        auth:
          (API.defaults?.headers as any)?.common?.Authorization
            ? `present len=${String((API.defaults?.headers as any).common.Authorization).length}`
            : 'none',
      });

      const { success, data, error } = res.data || {};
      const list = Array.isArray(data?.emotionList) ? data.emotionList : [];

      if (res.status === 200 && success && list.length > 0) {
        const enriched: EmotionData[] = list.map((e: any) => ({
          date: e.date,
          emotion: e.emotion,
        }));
        setEmotionData(enriched);

        // ── 요약 문구 계산(연속 부정 감정 4일 이상) ──
        let summary = '특별한 감정 변화가 나타나지 않습니다.';
        const negativeEmotions = ['슬픔', '화남', '혐오'];
        const filteredDates = enriched
          .filter((e) => negativeEmotions.includes(e.emotion))
          .map((e) => new Date(e.date))
          .filter((d) => d.getTime() <= new Date().setHours(0, 0, 0, 0))
          .sort((a, b) => a.getTime() - b.getTime());

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
            count = 1;
            start = null;
            end = null;
          }
        }

        if (count >= 4 && start && end) {
          const fmt = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
          const today = new Date();
          const isEndToday =
            end.getFullYear() === today.getFullYear() &&
            end.getMonth() === today.getMonth() &&
            end.getDate() === today.getDate();

          summary = isEndToday
            ? `${fmt(start)}부터 오늘까지\n부정적인 감정이 기록되었습니다.`
            : `${fmt(start)}부터 ${fmt(end)}까지\n${
                Math.round((end.getTime() - start.getTime()) / 86400000) + 1
              }일간 부정적 감정이 기록되었습니다.`;
        }

        setSummaryMessage(summary);
      } else {
        console.log('[월단위 응답 요약]', { success, error, count: list.length });
        setEmotionData([]);
        setSummaryMessage('특별한 감정 변화가 나타나지 않습니다.');
      }
    } catch (error: any) {
      console.warn('월별 감정 불러오기 실패:', error?.response?.data || error?.message || error);
      setEmotionData([]);
      setSummaryMessage('특별한 감정 변화가 나타나지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 연/월 또는 userCode가 바뀌면 자동 재호출
  useEffect(() => {
    if (userCode) fetchMonthlyEmotions();
  }, [year, month, userCode]);

  const checkLinkStatus = () => {
    setChecking(true);
    if (!userCode) {
      setCheckLinkMessage('연동된 사용자 없음');
    } else {
      setCheckLinkMessage(`${userCode.slice(0, 8)} 사용자 연동 중`);
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
            userCode={userCode} // ← 더 이상 필요 없다면 CalendarGrid prop도 제거하세요.
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
            <Image source={require('../../../assets/images/emotion-box.png')} style={styles.emotionIcon} />
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
  // screen
  container: { flex: 1, backgroundColor: '#F3E1FF' },
  scrollContent: { paddingTop: 10, paddingHorizontal: 16, paddingBottom: 20 },

  // link status
  checkLinkWrapper: { alignItems: 'center', marginTop: 60 },
  checkLinkText: { fontSize: 12, fontWeight: '600', color: '#AA9DB0FF', textDecorationLine: 'underline' },

  // loading
  loadingOverlay: { marginTop: 24, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, color: '#666' },

  // summary
  summaryContainer: {
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryText: { fontSize: 14, lineHeight: 20, color: '#4B148F', textAlign: 'center' },

  // actions
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 16, top: 60 },
  checkButtonContainer: { paddingVertical: 8, borderRadius: 8 },
  checkButtonText: { fontSize: 16, fontWeight: '800', color: '#4B148F' },

  // icons
  emotionIcon: { width: 28, height: 28, resizeMode: 'contain' },
  requestIcon: { width: 30, height: 30, resizeMode: 'contain' },
  logoutIcon: { width: 26, height: 26, resizeMode: 'contain' },

  // floating buttons
  requestButton: { position: 'absolute', top: 70, left: 30 },
  logoutButton: { position: 'absolute', top: 70, right: 30 },
});


export default MainScreen_G;