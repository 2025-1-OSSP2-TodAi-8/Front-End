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

type ShowRange='partial'|'full';
const VALID_RANGE: ShowRange[] = ['partial', 'full'];

const Mypage: React.FC<{ navigation: any; setUserToken: (token: string | null) => void; setUserType: (type: 'user' | 'guardian' | null) => void; }> = ({
  navigation,
  setUserToken,
  setUserType
}) => {
  const [Range, setRange] = useState<Record<string, ShowRange>>({});
  const [userInfo, setUserInfo] = useState<null | {
    userCode: string;
    name: string;
    sharing: Array<{
      protectorId: string;
      protectorName: string;
      showRange: ShowRange;
    }>;
    notification: Array<{
      sharingId: string;
      protectorName: string;
      showRange: ShowRange;
    }>;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  //받은 메세지
  const [receivedMessages, setReceivedMessages]=useState<
  { messageId: string; guardianName: string; isRead: boolean } [] >([]);

  // ✅ 로그아웃 핸들러 (MainScreen 구조와 동일)
  useEffect(() => {
    if (userInfo?.sharing?.length) {
      const initial: Record<string, ShowRange> = {};
      userInfo.sharing.forEach((item) => {
        initial[item.protectorId] = item.showRange;
      });
      setRange(initial);
    }
  }, [userInfo]);

  const handleRange = (protectorId: string, newRange: ShowRange) => {
    setRange((prev) => ({
      ...prev,
      [protectorId]: newRange,
    }));
  };

  const saveRange = async (protectorId: string) => {
    const selected = Range[protectorId];
    if (!selected) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await API.post(
        '/api/people/update/showrange',
        {
          guardianId: protectorId,
          showRange: selected.toUpperCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('success', response?.data?.message ?? '저장되었습니다.');
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
    const response = await API.get('/api/people/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✅ API 응답:', response.data.data);

    const raw=response.data.data;
    const mappedSharing = (raw.sharing||[]).map((item: any)=>({
      protectorId: item.protectorId, 
      protectorName: item.protectorName, 
      showRange: item.showRange,
    }));

    setUserInfo({
      userCode: raw.userCode, 
      name: raw.name, 
      sharing: mappedSharing, 
      notification: raw.notification || [], 
    }); 
    setReceivedMessages(raw.messages || []);
  } catch (error) {
    console.log('❌ fetchUser 오류:', error);
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
    <WithMenuLayout setUserToken={setUserToken} setUserType={setUserType}>
      <SafeAreaView style={styles.container}>
        {!menuVisible && <MenuIcon isOpen={false} onPress={() => setMenuVisible(true)} />}

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

        <TouchableOpacity style={styles.alertButton} onPress={() => navigation.navigate('AlertScreen')}>
          <Image source={require('../../assets/images/alert.png')} style={styles.alert} />
        </TouchableOpacity>

        <Text style={styles.title}>내 정보</Text>

        <View style={styles.itemBox2}>
          <Text style={styles.name}>이름: {userInfo.name}</Text>
          <Text style={styles.name}>유저 ID: {userInfo.userCode}</Text>
        </View>

        <Text style={styles.sectionTitle}>현재 연동된 보호자</Text>

        {userInfo.sharing && userInfo.sharing.length > 0 ? (
          <FlatList
            data={userInfo.sharing}
            keyExtractor={(item) => item.protectorId.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemBox}>
                <Text style={styles.name2}>보호자 이름: {item.protectorName}</Text>
                <Text style={styles.name2}>현재 공개범위: {item.showRange}</Text>

                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  {VALID_RANGE.map((range) => (
                    <TouchableOpacity
                      key={range}
                      onPress={() => handleRange(item.protectorId, range)}
                      style={{
                        marginRight: 10,
                        backgroundColor:
                          Range[item.protectorId] === range ? '#531ea3' : '#ccc',
                        padding: 6,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: '#fff' }}>{range}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={{ marginTop: 10, backgroundColor: '#531ea3', padding: 8, borderRadius: 5 }}
                  onPress={() => saveRange(item.protectorId)}
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
        <Text style={styles.sectionTitle2}>받은 메세지</Text>
        {receivedMessages&&receivedMessages.length>0?(
          <FlatList
            data={receivedMessages}
            keyExtractor={(item, index)=>index.toString()}
            renderItem={({item})=>(
              <TouchableOpacity 
              style={styles.messageBox}
              onPress={()=>navigation.navigate('ReceiveMessage', {
                messageId: item.messageId,
                sender: item.guardianName,
              })
            }
              >
                <Text style={styles.messageSender}>From. {item.guardianName}님</Text>
              </TouchableOpacity>
            )}
          contentContainerStyle={{paddingBottom:20}}
          />
        ):(
          <Text style={styles.subText}>받은 메세지가 없습니다. </Text>
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
    fontSize: 14,
    marginBottom: 8,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
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
    fontSize: 14,
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
  sectionTitle2: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
    color: '#531ea3',
  }, 
  messageBox: {
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginHorizontal: 20, 
    marginBottom: 10, 
    elevation: 1, 
  }, 
  messageSender: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  }, 
  messageContent: {
    fontSize: 14,
    marginBottom: 4,
  }, 
  messageDate: {
    fontSize: 12,
    color: '#777',
  }, 
});