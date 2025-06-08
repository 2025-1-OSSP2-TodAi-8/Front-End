/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../../api/axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useLink } from '../LinkContext';

const folderIcon = require('../../../assets/images/emotion-box.png');
const calendarIcon = require('../../../assets/images/calendar.png');

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../../assets/images/surprise2.png'),
  화남: require('../../../assets/images/angry2.png'),
  행복: require('../../../assets/images/happy2.png'),
  슬픔: require('../../../assets/images/sad2.png'),
  혐오: require('../../../assets/images/disgust2.png'),
  공포: require('../../../assets/images/fear2.png'),
};

const FavoriteYear: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MainScreen_G'>>();
  const { targetIdNum } = useLink();

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [emotionMap, setEmotionMap] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchYearlyEmotion = async () => {
      setLoading(true);

      try {
        if (!targetIdNum) {
          Alert.alert('오류', '연동된 사용자 ID가 없습니다.');
          setLoading(false);
          return;
        }

        const res = await API.post('/api/people/share/marked/year', {
          user_id:Number(targetIdNum),
          year: year,
        });
        console.log('[FavoriteYear] fetch payload →', {
          user_id: Number(targetIdNum),
          year,
        });

        if (res.status === 200 && Array.isArray(res.data.emotions)) {
          const monthlyMap = getMonthlyEmotionMap(res.data.emotions);
          setEmotionMap(monthlyMap);
        } else {
          setEmotionMap({});
        }
      } catch (err) {
        console.error('연도별 감정 불러오기 실패:', err);
        Alert.alert('연결 오류', '서버와 통신 중 오류가 발생했습니다.');
        setEmotionMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyEmotion();
  }, [year, targetIdNum]);

  const getMonthlyEmotionMap = (
    emotionList: { date: string; emotion: string }[]
  ): { [key: string]: string[] } => {
    const map: { [key: string]: string[] } = {};

    for (const { date, emotion } of emotionList) {
      const monthStr = new Date(date).toLocaleString('en-US', { month: 'short' });
      if (!map[monthStr]) {
        map[monthStr] = [];
      }
      if (map[monthStr].length < 4) {
        map[monthStr].push(emotion);
      }
    }

    return map;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.calendarButton}
        onPress={() => navigation.navigate('MainScreen_G')}
        activeOpacity={0.7}
      >
        <Image source={calendarIcon} style={styles.calendarIcon} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>감정 보관함</Text>
        <Image source={folderIcon} style={styles.titleImage} resizeMode="contain" />
      </View>

      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}년</Text>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#531ea3" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      )}

      {!loading && (
        <FlatList
          data={months}
          numColumns={2}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => {
            const monthNumber = index + 1;
            const emotionList: string[] = emotionMap[item] || [];

            return (
              <TouchableOpacity
                style={styles.itemContainer}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('FavoriteMonth', {
                    year: year,
                    month: monthNumber,
                  })
                }
              >
                <View style={styles.monthCard}>
                  <View style={styles.innerGrid}>
                    {emotionList.slice(0, 4).map((emo, idx) => {
                      const imgSrc = emotionImageMap[emo];
                      if (!imgSrc) return null;
                      return (
                        <Image
                          key={idx}
                          source={imgSrc}
                          style={styles.smallEmotionImage}
                          resizeMode="contain"
                        />
                      );
                    })}
                  </View>
                </View>
                <Text style={styles.monthText}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8FF',
    paddingTop: 85,
  },
  calendarButton: {
    position: 'absolute',
    top: 70,
    left: 30,
    zIndex: 1,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  titleImage: {
    width: 30,
    height: 30,
    marginLeft: 8,
    marginTop: 6,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#6A0DAD',
    marginHorizontal: 16,
  },
  yearText: {
    fontSize: 20,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  grid: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  monthCard: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5E8FF',
    borderWidth: 2,
    borderColor: '#B39DDB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGrid: {
    width: '90%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallEmotionImage: {
    width: '45%',
    height: '45%',
    margin: '2.5%',
  },
  monthText: {
    marginTop: 8,
    fontSize: 18,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
});

export default FavoriteYear;
