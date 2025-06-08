/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import API from '../../../api/axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useLink } from '../LinkContext';

const emotionImageMap: { [key: string]: any } = {
  중립: require('../../../assets/images/neutral.png'),
  놀람: require('../../../assets/images/surprise.png'),
  화남: require('../../../assets/images/angry.png'),
  행복: require('../../../assets/images/happy.png'),
  슬픔: require('../../../assets/images/sad.png'),
  혐오: require('../../../assets/images/disgust.png'),
  공포: require('../../../assets/images/fear.png'),
};

const folderIcon = require('../../../assets/images/emotion-box.png');

const FavoriteMonth: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MonthDetail'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MonthDetail'>>();
  const { year, month } = route.params;
  const { targetIdNum } = useLink();

  const [entries, setEntries] = useState<{ date: string; emotion: string; summary: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGuardianFavorites = async () => {
      setLoading(true);

      try {
        if (!targetIdNum) {
          Alert.alert('오류', '연동된 사용자 ID를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const res = await API.post('/api/people/share/marked/month', {
          user_id: targetIdNum,
          year,
          month,
        });

        if (res.status === 200 && Array.isArray(res.data.emotions)) {
          const data = res.data.emotions.map((item: any) => ({
            date: item.date,
            emotion: item.emotion,
            summary: item.summary,
          }));
          setEntries(data);
        } else {
          setEntries([]);
          Alert.alert('알림', '해당 월에 즐겨찾기된 감정이 없습니다.');
        }
      } catch (err) {
        console.error('월별 즐겨찾기 불러오기 실패:', err);
        Alert.alert('연결 오류', '서버와 통신 중 오류가 발생했습니다.');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardianFavorites();
  }, [year, month, targetIdNum]);

  const handleBackToCalendar = () => {
    navigation.goBack();
  };

  const handleGoBackToFavorites = () => {
    navigation.navigate('FavoriteYear');
  };

  const renderEntry = ({ item }: { item: { date: string; emotion: string; summary: string } }) => {
    const [y, m, d] = item.date.split('-').map((str) => parseInt(str, 10));
    const formattedDate = `${y}년 ${m}월 ${d}일`;
    const iconSource = emotionImageMap[item.emotion] || null;

    return (
      <View style={styles.entryContainer}>
        {iconSource && <Image source={iconSource} style={styles.entryIcon} />}
        <View style={styles.entryTextContainer}>
          <Text style={styles.entryDate}>{formattedDate}</Text>
          <Text style={styles.entrySummary}>{item.summary}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.monthContainer}>
      <FlatList
  data={entries}
  keyExtractor={(item) => item.date}
  renderItem={renderEntry}
  contentContainerStyle={styles.monthScroll}
  ListHeaderComponent={
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerTextWrapper} onPress={handleBackToCalendar}>
          <Text style={styles.headerText}>{`${year}년 ${month}월`}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.folderIconWrapper} onPress={handleGoBackToFavorites}>
          <Image source={folderIcon} style={styles.folderIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.titleText}>즐겨찾기 한 감정</Text>
    </>
  }
  ListEmptyComponent={
    !loading ? (
      <Text style={styles.emptyText}>해당 월에 즐겨찾기된 감정이 없습니다.</Text>
    ) : null
  }
  ListFooterComponent={
    loading ? (
      <ActivityIndicator size="large" color="#531ea3" style={{ marginTop: 20 }} />
    ) : null
  }
/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  monthContainer: {
    flex: 1,
    backgroundColor: '#F5E8FF',
    paddingTop: 60,
  },
  monthScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  headerTextWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginBottom: 2,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
    marginTop: 40,
  },
  folderIconWrapper: {
    position: 'absolute',
    right: 0,
    top: 29,
    bottom: 0,
    justifyContent: 'center',
    paddingRight: 8,
  },
  folderIcon: {
    width: 32,
    height: 32,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6A0DAD',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  entryIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  entryTextContainer: {
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B148F',
    marginBottom: 4,
  },
  entrySummary: {
    fontSize: 14,
    color: '#555555',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default FavoriteMonth;
