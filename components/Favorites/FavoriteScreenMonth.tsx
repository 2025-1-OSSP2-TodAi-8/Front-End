/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
// 파일: components/Favorites/FavoriteScreenMonth.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';

const folderIcon = require('../../assets/images/emotion-box.png');

const emotionImageMap: { [key: string]: any } = {
  놀람: require('../../assets/images/surprise2.png'),
  화남: require('../../assets/images/angry2.png'),
  행복: require('../../assets/images/happy2.png'),
  슬픔: require('../../assets/images/sad2.png'),
  혐오: require('../../assets/images/disgust2.png'),
  공포: require('../../assets/images/fear2.png'),
};

type MonthEntry = {
  date: string;
  emotion: string;
  summary: string;
};

type Props = {
  navigation: any;
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
};

const FavoriteScreenMonth: React.FC<Props> = ({ navigation, setUserToken,setUserType}) => {
  const route = useRoute<RouteProp<RootStackParamList, 'MonthDetail'>>();
  const { year, month } = route.params;

  const [entries, setEntries] = useState<MonthEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem('accessToken');
    setUserToken(null);
    setUserType(null);
    navigation.replace('LoginScreen');
  }, [navigation, setUserToken,setUserType]);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          setUserToken(null);
          return;
        }

        const res = await fetch('http://121.189.72.83:8888/api/diary/marked_month', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ year, month }),
        });

        if (res.status !== 200) {
          setEntries([]);
          return;
        }

        const json = await res.json();
        const dataList: MonthEntry[] = Array.isArray(json.emotions)
          ? json.emotions.map((item: any) => ({
              date: item.date,
              emotion: item.emotion,
              summary: item.summary,
            }))
          : [];

        setEntries(dataList);
      } catch (err) {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [year, month, setUserToken]);

  const renderEntry = ({ item }: { item: MonthEntry }) => {
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
    <WithMenuLayout setUserToken={setUserToken}setUserType={setUserType}>
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
          setUserType={setUserType}
          isOpen={menuVisible}
          toggleMenu={() => setMenuVisible(false)}
        />
      )}

      <SafeAreaView style={styles.monthContainer}>
        <Text style={styles.headerText}>{`${year}년 ${month}월`}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.emptyText}>해당 월에 즐겨찾기된 감정이 없습니다.</Text>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.date}
            renderItem={renderEntry}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </WithMenuLayout>
  );
};

const styles = StyleSheet.create({
  monthContainer: {
    flex: 1,
    backgroundColor: '#F5E8FF',
    paddingTop: 60,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A0DAD',
    textAlign: 'center',
    marginVertical: 16,
  },
  entryContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignSelf: 'center',
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

export default FavoriteScreenMonth;
