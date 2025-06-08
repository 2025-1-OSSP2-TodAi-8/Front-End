import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api/axios';
import WithMenuLayout from '../MenuBar/MenuBarLayout';
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';

const VALID_RANGE = ['partial', 'full'];

const Mypage: React.FC<{ navigation: any; setUserToken: (token: string | null) => void }> = ({
  navigation,
  setUserToken,
}) => {
  const [Range, setRange] = useState<Record<number, string>>({});
  const [userInfo, setUserInfo] = useState<null | {
    user_id: number;
    name: string;
    sharing: Array<{
      protector_id: number;
      protector_name: string;
      공개범위: string;
    }>;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // ✅ 로그아웃 핸들러 (MainScreen 구조와 동일)

  useEffect(() => {
    if (userInfo?.sharing) {
      const initialRange: Record<number, string> = {};
      userInfo.sharing.forEach((item) => {
        initialRange[item.protector_id] = item.공개범위;
      });
      setRange(initialRange);
    }
  }, [userInfo]);

  const handleRange = (protector_id: number, newRange: string) => {
    setRange((prev) => ({
      ...prev,
      [protector_id]: newRange,
    }));
  };

  const saveRange = async (protectorId: number) => {
    const selectRange = Range[protectorId];
    if (!selectRange) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await API.post(
        '/api/people/update/showrange',
        {
          protector_id: protectorId,
          공개범위: selectRange,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('success', response.data.message);
      fetchUser();
    } catch (error) {
      Alert.alert('error', 'ShowRangeError');
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('토큰 오류', '로그인이 필요합니다.');
        return;
      }
      const response = await API.get('/api/people', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      Alert.alert('오류', '마이페이지 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.center}>
        <Text>유저 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <WithMenuLayout setUserToken={setUserToken}>
      <SafeAreaView style={styles.container}>
        {!menuVisible && (
          <MenuIcon isOpen={false} onPress={() => setMenuVisible(true)} />
        )}

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

        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => navigation.navigate('AlertScreen')}
        >
          <Image
            source={require('../../assets/images/alert.png')}
            style={styles.alert}
          />
        </TouchableOpacity>

        <Text style={styles.title}>내 정보</Text>

        <View style={styles.itemBox2}>
          <Text style={styles.name}>이름: {userInfo.name}</Text>
          <Text style={styles.name}>유저 ID: {userInfo.user_id}</Text>
        </View>

        <Text style={styles.sectionTitle}>현재 연동된 보호자</Text>

        {userInfo.sharing && userInfo.sharing.length > 0 ? (
          <FlatList
            data={userInfo.sharing}
            keyExtractor={(item) => item.protector_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemBox}>
                <Text style={styles.name2}>보호자 이름: {item.protector_name}</Text>
                <Text style={styles.name2}>현재 공개범위: {item.공개범위}</Text>

                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  {VALID_RANGE.map((range) => (
                    <TouchableOpacity
                      key={range}
                      onPress={() => handleRange(item.protector_id, range)}
                      style={{
                        marginRight: 10,
                        backgroundColor:
                          Range[item.protector_id] === range ? '#531ea3' : '#ccc',
                        padding: 6,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: '#fff' }}>{range}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    backgroundColor: '#531ea3',
                    padding: 8,
                    borderRadius: 5,
                  }}
                  onPress={() => saveRange(item.protector_id)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>저장</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Text style={styles.subText}>연동된 보호자가 없습니다.</Text>
        )}
      </SafeAreaView>
    </WithMenuLayout>
  );
};

export default Mypage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
  },
  alertButton: {
    position: 'absolute',
    top: 80,
    right: 25,
    zIndex: 10,
  },
  alert: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#531ea3',
    textAlign: 'center',
    marginTop: 75,
    marginBottom: 20,
  },
  itemBox2: {
    backgroundColor: 'hsl(252, 100.00%, 89.40%)',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 10,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    paddingHorizontal: 135,
  },
  name: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 10,
    color: '#531ea3',
  },
  itemBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    paddingHorizontal: 100,
  },
  name2: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  subText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
