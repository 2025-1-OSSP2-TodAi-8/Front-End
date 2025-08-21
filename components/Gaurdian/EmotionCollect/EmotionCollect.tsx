/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import API from '../../../api/axios'; // ✅ axios 인스턴스 사용

// (프로젝트에 RootStackParamList가 있으면 그걸 import해서 쓰세요. 여기선 self-contained로 둡니다.)
type RootStackParamList = {
  EmotionDiaryList: { ym: string; emotionIndex: number; emotionLabel: string; targetId: string };
};
type Props = NativeStackScreenProps<RootStackParamList, 'EmotionDiaryList'>;

interface DiaryItem { date: string; emotion: string; summary: string; }

const EMOJI: Record<string, any> = {
  행복: require('../../../assets/images/happy.png'),
  슬픔: require('../../../assets/images/sad.png'),
  화남: require('../../../assets/images/angry.png'),
  놀람: require('../../../assets/images/surprise.png'),
  공포: require('../../../assets/images/fear.png'),
  혐오: require('../../../assets/images/disgust.png'),
};

const fmtKDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
};

const EmotionDiaryListScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation();
  const { ym, emotionIndex, emotionLabel, targetId } = route.params;

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<DiaryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const title = useMemo(() => `${emotionLabel} 기록들`, [emotionLabel]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ POST 사용 + API 인스턴스(baseURL 적용)
      const res = await API.post(`/api/people/sharing/${ym}/${emotionIndex}`, {
        targetId,
      });
      const json = res.data;
      if (!json?.success) throw new Error(json?.error || '요청 실패');
      setList(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      console.error('[EmotionDiaryList] fetch error:', e?.response?.data || e?.message || e);
      setList([]); // 화면 에러는 숨기고 비워둠
    } finally {
      setLoading(false);
    }
  }, [ym, emotionIndex, targetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={s.screen}>
      {/* 상단 헤더: 좌측 < 버튼 + 중앙 타이틀 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerSide} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backIcon}>{'<'}</Text>
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.title}>{title}</Text>
        </View>

        <View style={s.headerSide} />
      </View>

      {loading ? (
        <View style={[s.flexCenter, { paddingTop: 24 }]}>
          <ActivityIndicator color="#6A0DAD" />
          <Text style={s.dim}>불러오는 중…</Text>
        </View>
      ) : list.length === 0 ? (
        <View style={[s.flexCenter, { paddingTop: 24 }]}>
          <Text style={s.dim}>해당 감정의 일기가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item, idx) => `${item.date}-${idx}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          renderItem={({ item }) => {
            const icon = EMOJI[item.emotion];
            return (
              <View style={s.card}>
                <View style={s.emojiWrap}>
                  {icon ? <Image source={icon} style={s.emoji} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{fmtKDate(item.date)}</Text>
                  <Text style={s.cardSummary} numberOfLines={2}>
                    {item.summary?.trim() || '요약 없음'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

export default EmotionDiaryListScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3E1FF'},

  // 헤더 레이아웃: 좌/중/우(균형)
  header: {
    marginTop:50,
    height: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { 
    fontSize: 26, 
    color: '#5A19A8', 
    fontWeight: '800' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#5A19A8', 
    textAlign: 'center' 
  },
  flexCenter: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  dim: { 
    color: '#777', 
    marginTop: 8 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  emojiWrap: {
    width: 56, 
    height: 56, 
    borderRadius: 28,
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14,
  },
  emoji: { 
    width: 38, 
    height: 38, 
    resizeMode: 'contain' 
  },
  cardTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#2E1460', 
    marginBottom: 6 
  },
  cardSummary: { 
    fontSize: 14, 
    color: '#6C6C6C', 
    lineHeight: 20 
  },
});
