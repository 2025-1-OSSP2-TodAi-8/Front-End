import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator,Alert,TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api/axios';

const Mypage = ({ navigation }: { navigation: any }) => {
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
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Alert')}>
            <Image source={require('../../assets/images/alert.png')} style={styles.alert}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Alert')}>
            <Image source={require('../../assets/images/menuicon.png')} style={styles.menu}/>
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
                <Text style={styles.name2}>공개범위: {item.공개범위}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.subText}>연동된 보호자가 없습니다.</Text>
      )}
    </View>
  );
};

export default Mypage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
    paddingHorizontal: 20,
    paddingTop: 80,
    alignItems: 'center', 
  },
  title: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '600',
    color: '#531ea3',
    top: 50, 
  },
  name: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff',
    fontWeight: '600',
  },
  name2: {
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
    fontWeight: '500',
  }, 
  sectionTitle: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '600', 
    top: 250, 
    left: 50, 
    color: '#531ea3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 30,
    marginTop: 220, 
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    paddingHorizontal: 100,
  },
  itemBox2: {
    position: 'absolute',
    backgroundColor: 'hsl(252, 100.00%, 89.40%)',
    padding: 30,
    top: 110, 
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    paddingHorizontal: 135,
  },
  subText: {
    fontSize: 14,
    color: '#888',
  },
  alert: {
    width: 50,
        height: 50,
        resizeMode: 'contain',
  }, 
  menu: {
    width: 50,
        height: 50,
        resizeMode: 'contain',
  }
});
