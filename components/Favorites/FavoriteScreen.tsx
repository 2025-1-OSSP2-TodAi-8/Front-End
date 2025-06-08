/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import MenuBar from '../MenuBar/MenuBar';
import MenuIcon from '../MenuBar/MenuIcon';

const folderIcon = require('../../assets/images/emotion-box.png');

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../assets/images/surprise2.png'),
  화남: require('../../assets/images/angry2.png'),
  행복: require('../../assets/images/happy2.png'),
  슬픔: require('../../assets/images/sad2.png'),
  혐오: require('../../assets/images/disgust2.png'),
  공포: require('../../assets/images/fear2.png'),
};

type FavoritesScreenProps = {
  navigation: any;
  setUserToken: (token: string | null) => void;
};

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation, setUserToken }) => {
  const [year, setYear] = useState<number>(2025);
  const [emotionMap, setEmotionMap] = useState<{ [key: string]: string[] }>({});
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem('accessToken');
    setUserToken(null);
    navigation.replace('LoginScreen');
  }, [navigation, setUserToken]);

  useEffect(() => {
    const fetchYearlyEmotion = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.warn('[FavoritesScreen] accessToken이 없습니다. 로그인 화면으로 이동합니다.');
          setUserToken(null);
          return;
        }

        const res = await fetch(
          'http://121.189.72.83:8888/api/diary/marked_year',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ year }),
          }
        );
        const json = await res.json();
        const rawEmotionList: { date: string; emotion: string }[] =
          Array.isArray(json.emotions) ? json.emotions : [];

        const monthlyMap = getMonthlyEmotionMap(rawEmotionList);
        setEmotionMap(monthlyMap);
      } catch (err) {
        console.error('연도별 감정 불러오기 실패', err);
      }
    };

    fetchYearlyEmotion();
  }, [year, navigation, setUserToken]);

  const getMonthlyEmotionMap = (
    emotionList: { date: string; emotion: string }[] = []
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
    <WithMenuLayout setUserToken={setUserToken}>
      <SafeAreaView style={styles.container}>
        <MenuIcon isOpen={menuVisible} onPress={() => setMenuVisible((v) => !v)} />

        {menuVisible && (
          <MenuBar
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            onFavorites={() => {
              setMenuVisible(false);
              navigation.navigate('Favorites');
            }}
            setUserToken={setUserToken}
            isOpen={menuVisible}
            toggleMenu={() => setMenuVisible(false)}
          />
        )}

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
                  navigation.navigate('MonthDetail', {
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
      </SafeAreaView>
    </WithMenuLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8FF',
    paddingTop: 90,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    padding: 8,
  },
  innerGrid: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  smallEmotionImage: {
    width: '45%',
    height: '45%',
    marginVertical: '2%',
  },
  monthText: {
    marginTop: 8,
    fontSize: 18,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
