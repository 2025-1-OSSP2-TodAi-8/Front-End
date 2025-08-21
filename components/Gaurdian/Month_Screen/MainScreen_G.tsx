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
import EmotionGraph_G, { type EmotionStats } from './EmotionGraph_G';

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../../assets/images/surprise.png'),
  화남: require('../../../assets/images/angry.png'),
  행복: require('../../../assets/images/happy.png'),
  슬픔: require('../../../assets/images/sad.png'),
  혐오: require('../../../assets/images/disgust.png'),
  공포: require('../../../assets/images/fear.png'),
};

// ✅ EN → KO 매핑 (리스트·요약은 한국어로 유지)
const EN_TO_KO: Record<string, string> = {
  happy: '행복',
  sadness: '슬픔',
  anger: '화남',
  surprise: '놀람',
  fear: '공포',
  disgust: '혐오',
  unknown: '평범',
};

// ✅ 라우트/네비 타입
type MainRouteProp = RouteProp<RootStackParamList, 'MainScreen_G'>;
type MainNavProp   = NativeStackNavigationProp<RootStackParamList, 'MainScreen_G'>;

type EmotionData = { date: string; emotion: string };

// --- 유틸: 부정 감정 비율 계산(슬픔+화남+혐오) ---
const calcNegativePercent = (s: EmotionStats | null | undefined) => {
  if (!s) return 0;
  const total =
    s.total && s.total > 0
      ? s.total
      : s.happy + s.sadness + s.anger + s.surprise + s.fear + s.disgust + s.unknown;

  if (!total) return 0;
  const neg = s.sadness + s.anger + s.disgust;
  return Math.round((neg / total) * 100);
};

// --- 유틸: 권고 문구 추천(간단) ---
const recommendByNegative = (percent: number) => {
  if (percent >= 60) return '가까운 사람이나 전문가와 대화를 나눠보세요.';
  if (percent >= 50) return '짧은 산책, 가벼운 운동으로 긴장을 풀어보세요.';
  return '수면과 식사를 규칙적으로 챙기며 루틴을 유지해보세요.';
};

// --- 유틸: 캘린더 모드 요약(연속 부정 감정 4일 이상) ---
const buildCalendarSummary = (list: EmotionData[]) => {
  let summary = '특별한 감정 변화가 나타나지 않습니다.';
  const negativeEmotions = ['슬픔', '화남', '혐오'];

  const filteredDates = list
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
  return summary;
};

const MainScreen_G: React.FC<{
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}> = ({ setUserToken, setUserType }) => {
  const navigation = useNavigation<MainNavProp>();
  const route = useRoute<MainRouteProp>();
  const { userCode } = route.params;

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(5);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [emotionStats, setEmotionStats] = useState<EmotionStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkLinkMessage, setCheckLinkMessage] = useState('연동 확인');

  // ✅ 요약을 메인/권고로 분리
  const [summaryMain, setSummaryMain] = useState<string>('');
  const [summaryRecommend, setSummaryRecommend] = useState<string>('');

  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('calendar');

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

  const ym = `${year}-${String(month).padStart(2, '0')}`;

  // ✅ 월별 감정 조회
  const fetchMonthlyEmotions = async () => {
    setLoading(true);
    try {
      if (!userCode) {
        console.warn('userCode가 없습니다.');
        setEmotionData([]);
        setEmotionStats(null);
        setSummaryMain('특별한 감정 변화가 나타나지 않습니다.');
        setSummaryRecommend('');
        return;
      }

      const res = await API.post(`/api/people/sharing/month/${ym}`, {
        targetId: userCode,
      });

      const { success, data, error } = res.data || {};
      console.log('[REQ/MONTH]', { url: `/api/people/sharing/month/${ym}`, body: { userCode } });
      console.log('응답 data:', data);

      if (res.status === 200 && success && data) {
        // 1) 캘린더용 리스트
        const listRaw = Array.isArray(data.emotionList) ? data.emotionList : [];
        const list: EmotionData[] = listRaw
          .map((e: any) => {
            const ko = EN_TO_KO[e.emotion] || e.emotion;
            return { date: e.date, emotion: ko };
          })
          .filter((e: { emotion: string }) => !!emotionImageMap[e.emotion]);

        setEmotionData(list);

        // 2) 그래프용 통계
        const stats: EmotionStats = {
          happy: data.happy ?? 0,
          sadness: data.sadness ?? 0,
          anger: data.anger ?? 0,
          surprise: data.surprise ?? 0,
          fear: data.fear ?? 0,
          disgust: data.disgust ?? 0,
          unknown: data.unknown ?? 0,
          total: data.total ?? 0,
        };
        setEmotionStats(stats);

        // 3) 캘린더 모드 기본 요약 갱신
        setSummaryMain(buildCalendarSummary(list));
        setSummaryRecommend('');
      } else {
        console.log('[월단위 응답 요약]', { success, error });
        setEmotionData([]);
        setEmotionStats(null);
        setSummaryMain('특별한 감정 변화가 나타나지 않습니다.');
        setSummaryRecommend('');
      }
    } catch (error: any) {
      console.warn('월별 감정 불러오기 실패:', error?.response?.data || error?.message || error);
      setEmotionData([]);
      setEmotionStats(null);
      setSummaryMain('특별한 감정 변화가 나타나지 않습니다.');
      setSummaryRecommend('');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 연/월 또는 userCode가 바뀌면 자동 재호출
  useEffect(() => {
    if (userCode) fetchMonthlyEmotions();
  }, [year, month, userCode]);

  // ✅ 화면 모드/데이터에 따른 요약 문구 자동 갱신
  useEffect(() => {
    if (viewMode === 'graph') {
      const p = calcNegativePercent(emotionStats);
      if (p >= 40) {
        setSummaryMain(`이번 달 부정 감정이 ${p}%를 차지합니다.`);
        setSummaryRecommend(`${recommendByNegative(p)}`);
      } else {
        setSummaryMain(`이번 달 부정 감정 비율: ${p}%\n전반적으로 무난해요.`);
        setSummaryRecommend('');
      }
    } else {
      setSummaryMain(buildCalendarSummary(emotionData));
      setSummaryRecommend('');
    }
  }, [viewMode, emotionStats, emotionData]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단: 연동 상태 확인 */}
      <View style={styles.checkLinkWrapper}>
        <TouchableOpacity onPress={checkLinkStatus} disabled={checking}>
          <Text style={styles.checkLinkText}>{checkLinkMessage}</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          {/* ✅ 연/월 선택기: 항상 표시 */}
          <YearMonthSelector
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />

          {/* ✅ 아래 영역만 전환 */}
          {viewMode === 'calendar' ? (
            <CalendarGrid
              year={year}
              month={month}
              emotionData={emotionData}
              emotionImageMap={emotionImageMap}
              userCode={userCode}
            />
          ) : (
            <EmotionGraph_G
              stats={emotionStats}
              ym={ym}
              targetId={userCode}
            />
          )}
        </View>

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6A0DAD" />
            <Text style={styles.loadingText}>월별 감정을 불러오는 중...</Text>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            {/* ⬇️ 회색 작은 제목 */}
            <Text style={styles.summaryBadge}>주요 요약</Text>
            <Text style={styles.summaryText}>{summaryMain}</Text>
            {!!summaryRecommend && (
              <Text style={styles.recommendText}>{summaryRecommend}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ✅ 토글 버튼: ScrollView 뒤에 두고 zIndex/elevation 주기 */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setViewMode(viewMode === 'calendar' ? 'graph' : 'calendar')}
        activeOpacity={0.8}
      >
        <Image
          source={
            viewMode === 'calendar'
              ? require('../../../assets/images/circle_graph.png')
              : require('../../../assets/images/calendar.png')
          }
          style={styles.toggleIcon}
        />
      </TouchableOpacity>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Image source={require('../../../assets/images/logout.png')} style={styles.logoutIcon} />
      </TouchableOpacity>
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
  summaryBadge: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#9AA0A6',
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B148F',
    textAlign: 'center',
  },
  // ✅ 권고만 더 작게
  recommendText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4B148F',
    textAlign: 'center',
    marginTop: 4,
  },

  // icons
  toggleIcon: { width: 30, height: 30, resizeMode: 'contain' },
  logoutIcon: { width: 26, height: 26, resizeMode: 'contain' },

  // floating buttons
  toggleButton: {
    position: 'absolute',
    top: 70,
    left: 30,
    zIndex: 999,
    elevation: 20,
    padding: 4,
  },
  logoutButton: {
    position: 'absolute',
    top: 70,
    right: 30,
    zIndex: 999,
    elevation: 20,
    padding: 4,
  },
});

export default MainScreen_G;
